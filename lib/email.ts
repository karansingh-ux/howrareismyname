import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface EmailReportParams {
  to: string;
  name: string;
  normalizedName: string;
  rarityLabel: string;
  rank?: number | null;
  oneInX?: number | null;
  displayStatistic: string;
  explanation?: string;
  unsubscribeToken: string;
  isUltraRare?: boolean;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  provider: 'resend' | 'smtp' | 'log_mode';
  error?: string;
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  return 'https://howrareismyname.in';
}

export function generateReportHtml(params: EmailReportParams): string {
  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}/r/${encodeURIComponent(params.normalizedName)}`;
  const unsubUrl = `${baseUrl}/api/unsubscribe?token=${encodeURIComponent(params.unsubscribeToken)}`;
  const formattedRank = params.rank ? `#${params.rank.toLocaleString('en-IN')}` : 'Top 0.01%';
  const frequencyDisplay = params.isUltraRare
    ? '< 1 in 15,000,000'
    : params.oneInX
    ? `1 in ${params.oneInX.toLocaleString('en-IN')}`
    : 'Distinctive';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Name Rarity Report for ${params.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f7f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e5e5; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #737373;">
                NAME RARITY REPORT
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 24px 32px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; font-size: 38px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; color: #171717;">
                ${params.name}
              </h1>
              <div>
                <span style="display: inline-block; background-color: #171717; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px;">
                  ${params.rarityLabel}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fbfbfb; border: 1px solid #eeeeee; border-radius: 12px; padding: 24px 16px; text-align: center;">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #737373;">
                      Frequency
                    </span>
                    <div style="font-size: 32px; font-weight: 900; color: #171717; margin: 6px 0 8px 0; letter-spacing: -0.01em;">
                      ${frequencyDisplay}
                    </div>
                    <p style="margin: 0; font-size: 13px; color: #525252; line-height: 1.5;">
                      ${params.displayStatistic}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #737373;">National Rank</div>
                    <div style="font-size: 18px; font-weight: 800; color: #171717; margin-top: 4px;">${formattedRank}</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #737373;">Rarity Status</div>
                    <div style="font-size: 16px; font-weight: 800; color: #171717; margin-top: 4px;">${params.rarityLabel}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${params.explanation ? `
          <tr>
            <td style="padding: 0 32px 28px 32px; text-align: center;">
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #525252;">
                ${params.explanation}
              </p>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 0 32px 36px 32px; text-align: center;">
              <a href="${shareUrl}" target="_blank" style="display: inline-block; background-color: #171717; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                View & Share Your Result →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #eeeeee; text-align: center; font-size: 11px; color: #a3a3a3; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;">
                Calculated using official national electoral registers and demographic records.
              </p>
              <p style="margin: 0;">
                You received this report because you requested it on How Rare Is My Name?<br>
                <a href="${unsubUrl}" style="color: #737373; text-decoration: underline;">Unsubscribe</a> anytime with one click.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export async function sendNameReportEmail(params: EmailReportParams): Promise<EmailDispatchResult> {
  const html = generateReportHtml(params);
  const subject = `Your Name Rarity Report for ${params.name} (${params.rarityLabel})`;
  const fromAddress = process.env.EMAIL_FROM || 'Name Rarity <reports@howrareismyname.in>';

  // 1. Check for Resend API Key
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [params.to],
          subject,
          html
        })
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, messageId: data.id, provider: 'resend' };
      } else {
        console.error('Resend API error:', data);
        return { success: false, error: data.message || 'Resend error', provider: 'resend' };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to send via Resend:', errorMsg);
      return { success: false, error: errorMsg, provider: 'resend' };
    }
  }

  // 2. Check for SMTP credentials
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: params.to,
        subject,
        html
      });

      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to send via SMTP:', errorMsg);
      return { success: false, error: errorMsg, provider: 'smtp' };
    }
  }

  // 3. Fallback safe log mode (for development / before credentials are provided)
  const logDir = path.resolve(process.cwd(), 'data');
  const logFile = path.resolve(logDir, 'sent_emails.log');
  const logEntry = {
    timestamp: new Date().toISOString(),
    to: params.to,
    name: params.name,
    subject,
    status: 'RECORDED_READY_FOR_DELIVERY',
    note: 'Configure RESEND_API_KEY or SMTP_HOST/USER/PASS in .env.local to dispatch live emails.',
    htmlPreviewLength: html.length
  };

  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch {
    // Non-blocking
  }

  console.log(`[Email Dispatch] Email report prepared for ${params.to} (${params.name}, ${params.rarityLabel}). Logged to ${logFile}`);
  return {
    success: true,
    messageId: `log_${Date.now()}`,
    provider: 'log_mode'
  };
}
