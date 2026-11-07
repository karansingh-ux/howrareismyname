'use client';

import React, { useState } from 'react';

interface EmailCaptureProps {
  nameEntered: string;
  normalizedName: string;
  resultRank?: number;
  sessionId?: string;
}

export default function EmailCapture({
  nameEntered,
  normalizedName,
  resultRank,
  sessionId
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setFeedbackMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nameEntered,
          normalizedName,
          resultRank,
          marketingConsent,
          sessionId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setFeedbackMessage(data.message || 'Your report request has been registered!');
      } else {
        setStatus('error');
        setFeedbackMessage(data.message || 'Unable to register your request. Please try again.');
      }
    } catch {
      setStatus('error');
      setFeedbackMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="mt-8 p-6 bg-neutral-50 border border-neutral-200 rounded-2xl text-center">
        <div className="w-8 h-8 mx-auto mb-3 text-neutral-900 flex items-center justify-center rounded-full bg-neutral-200/70">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="type-heading-2 text-base font-semibold text-neutral-900 mb-1">Receipt incoming!</h3>
        <p className="type-body text-xs text-neutral-600 max-w-sm mx-auto">
          Check your inbox shortly. We&apos;ve queued up the full breakdown for <strong>{nameEntered}</strong>.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-10 text-left max-w-md mx-auto">
      <div className="p-6 sm:p-7 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-md">
        <h3 className="type-heading-2 text-neutral-900 mb-2">
          Want the full receipt in your inbox?
        </h3>
        <p className="type-body text-xs text-neutral-600 mb-3">
          Drop your email and we&apos;ll send you the whole breakdown:
        </p>
        <ul className="type-body text-xs text-neutral-600 space-y-1.5 mb-5 pl-4 list-disc">
          <li>Your exact rank and 1-in-X odds to save or flex</li>
          <li>How your name stacks up against the crowd</li>
          <li>A quick peek under the hood at the public data sources</li>
          <li>First dibs when we drop new regional datasets</li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              disabled={status === 'loading'}
              className="flex-1 px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white type-eyebrow text-xs tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {status === 'loading' ? 'Sending...' : 'Send it over'}
            </button>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-[11px] text-neutral-500 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
              />
              <span>
                Keep me posted with fun name stats and new interactive experiments.
              </span>
            </label>
          </div>

          {status === 'error' && (
            <p className="text-xs text-red-600 mt-1">{feedbackMessage}</p>
          )}

          <p className="text-[11px] text-neutral-400 leading-normal pt-1">
            Zero spam. We won&apos;t sell your email — we&apos;re not monsters.
          </p>
        </form>
      </div>
    </section>
  );
}
