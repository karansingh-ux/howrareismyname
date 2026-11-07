import { NextRequest, NextResponse } from 'next/server';
import { subscribeUser, validateEmail } from '@/lib/subscribers';
import { calculateNameRarity } from '@/lib/rarity';
import { sendNameReportEmail } from '@/lib/email';
import { logAnalyticsEvent } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nameEntered, normalizedName, resultRank, marketingConsent, sessionId } = body;

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!nameEntered || typeof nameEntered !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Name entered is required.' },
        { status: 400 }
      );
    }

    const outcome = subscribeUser({
      email,
      nameEntered,
      normalizedName: normalizedName || nameEntered.trim().toLowerCase(),
      resultRank: typeof resultRank === 'number' ? resultRank : null,
      marketingConsent: Boolean(marketingConsent)
    });

    logAnalyticsEvent('email_submitted', sessionId, {
      has_rank: typeof resultRank === 'number',
      marketing_consent: Boolean(marketingConsent)
    });

    if (marketingConsent) {
      logAnalyticsEvent('marketing_consent_given', sessionId);
    }

    // Dispatch transactional report email immediately
    if (outcome.success && outcome.unsubscribeToken) {
      const rarityData = await calculateNameRarity(nameEntered);
      await sendNameReportEmail({
        to: email.trim().toLowerCase(),
        name: rarityData.name || nameEntered,
        normalizedName: rarityData.normalizedName || nameEntered.trim().toLowerCase(),
        rarityLabel: rarityData.rarityLabel,
        rank: rarityData.rank ?? null,
        oneInX: rarityData.oneInX ?? null,
        displayStatistic: rarityData.displayStatistic,
        explanation: rarityData.explanation,
        unsubscribeToken: outcome.unsubscribeToken,
        isUltraRare: rarityData.isUltraRare
      });
    }

    return NextResponse.json(outcome, { status: outcome.success ? 200 : 400 });
  } catch (error) {
    console.error('API /api/subscribe error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred while saving your subscription.' },
      { status: 500 }
    );
  }
}
