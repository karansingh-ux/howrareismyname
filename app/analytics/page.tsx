'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { AnalyticsSummary } from '@/lib/analytics';

const TIME_RANGES = [
  { id: 'today', label: 'Today' },
  { id: '24h', label: 'Last 24h' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'all', label: 'All Time' }
];

export default function AnalyticsDashboardPage() {
  const [range, setRange] = useState<string>('7d');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchAnalytics = useCallback(async (selectedRange: string, silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      if (res.ok) {
        const json: AnalyticsSummary = await res.json();
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, fetchAnalytics]);

  // Live polling every 8s
  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      fetchAnalytics(range, true);
    }, 8000);
    return () => clearInterval(interval);
  }, [isPolling, range, fetchAnalytics]);

  const handleExportCsv = () => {
    window.location.href = '/api/analytics?format=csv';
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `name-rarity-analytics-${range}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRarityBadgeStyle = (label?: string) => {
    switch (label) {
      case 'ULTRA-RARE':
        return 'bg-neutral-900 text-white ring-1 ring-neutral-400 font-extrabold';
      case 'VERY COMMON':
        return 'bg-blue-600 text-white';
      case 'COMMON':
        return 'bg-neutral-800 text-neutral-100';
      case 'MODERATELY COMMON':
        return 'bg-neutral-700 text-neutral-100';
      case 'UNCOMMON':
        return 'bg-neutral-200 text-neutral-800';
      case 'RARE':
        return 'bg-neutral-100 text-neutral-900 border border-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col justify-between bg-transparent text-neutral-900 selection:bg-neutral-900 selection:text-white pb-12">
      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="type-eyebrow text-white hover:text-white/80 transition-colors font-bold tracking-wider drop-shadow-xs flex items-center gap-2"
          >
            <span>←</span>
            <span>How Rare Is My Name?</span>
          </Link>
          <span className="hidden sm:inline-block text-white/40">•</span>
          <span className="type-eyebrow text-white/80 text-xs hidden sm:inline-block">Founder Analytics</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Polling Toggle */}
          <button
            type="button"
            onClick={() => setIsPolling(!isPolling)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
              isPolling
                ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30'
                : 'bg-white/10 text-white/70 border border-white/20'
            }`}
            title={isPolling ? 'Live polling active (every 8s)' : 'Live polling paused'}
          >
            <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-400'}`} />
            <span>{isPolling ? 'Live Pulse' : 'Paused'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={() => fetchAnalytics(range)}
            disabled={isRefreshing}
            className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-xs"
            title="Refresh analytics data"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-2">
        {/* Title & Controls Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-2 border border-white/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Real-Time Production Data</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-xs">
              Website Traffic & Interaction Hub
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xl">
              Track live visitors, searches, demographic distribution, and viral social shares across the platform.
            </p>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
            {TIME_RANGES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRange(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  range === t.id
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && !data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="p-5 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl animate-pulse h-32" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* Primary KPI Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Tile 1: Page Views */}
              <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="type-eyebrow text-[11px]">Total Views</span>
                  <span className="text-lg">👥</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {data.overview.totalPageViews.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] sm:text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-800">{data.overview.uniqueVisitors.toLocaleString('en-IN')}</span>
                  <span>unique visitors</span>
                </div>
              </div>

              {/* Tile 2: Searches Run */}
              <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="type-eyebrow text-[11px]">Names Checked</span>
                  <span className="text-lg">🔍</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {data.overview.totalSearches.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] sm:text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-600 font-semibold">Active Engine</span>
                  <span>• 100% resolution</span>
                </div>
              </div>

              {/* Tile 3: Social Shares */}
              <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="type-eyebrow text-[11px]">Social Shares</span>
                  <span className="text-lg">🚀</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {data.overview.totalShares.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] sm:text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-800">WhatsApp, X & IG</span>
                  <span>drops</span>
                </div>
              </div>

              {/* Tile 4: Virality Rate */}
              <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="type-eyebrow text-[11px]">Share Rate</span>
                  <span className="text-lg">📈</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {data.overview.viralityRate}
                </div>
                <div className="text-[11px] sm:text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <span className="text-neutral-700 font-semibold">Top: {data.overview.topRegion}</span>
                </div>
              </div>
            </div>

            {/* Middle Grid: Volume Trend & Rarity Spectrum */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Daily Trend Chart (2 columns on lg) */}
              <div className="lg:col-span-2 p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="type-eyebrow text-neutral-900 font-bold text-xs">
                      Daily Traffic & Engagement
                    </h2>
                    <p className="text-neutral-500 text-xs mt-0.5">
                      Visual activity curve over the last 7 days
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-neutral-950" />
                      <span>Searches</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-blue-500" />
                      <span>Page Views</span>
                    </span>
                  </div>
                </div>

                {/* CSS Bar Chart */}
                <div className="mt-6 flex items-end justify-between gap-2 sm:gap-4 h-44 sm:h-48 pt-4 pb-2 border-b border-neutral-100">
                  {(() => {
                    const maxVal = Math.max(1, ...data.dailyTrend.map(d => Math.max(d.views, d.searches)));
                    return data.dailyTrend.map((d, i) => {
                      const searchHeight = Math.max(6, Math.round((d.searches / maxVal) * 100));
                      const viewHeight = Math.max(6, Math.round((d.views / maxVal) * 100));

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                          {/* Hover Tooltip */}
                          <div className="text-[10px] text-neutral-500 font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.searches} checks
                          </div>

                          {/* Bars container */}
                          <div className="w-full flex items-end justify-center gap-1 h-32">
                            <div
                              style={{ height: `${searchHeight}%` }}
                              className="w-full max-w-[14px] bg-neutral-950 rounded-t-sm transition-all duration-300"
                              title={`${d.searches} name searches`}
                            />
                            <div
                              style={{ height: `${viewHeight}%` }}
                              className="w-full max-w-[14px] bg-blue-500 rounded-t-sm transition-all duration-300"
                              title={`${d.views} page views`}
                            />
                          </div>

                          <span className="text-[10px] sm:text-[11px] text-neutral-500 font-medium mt-2 truncate w-full text-center">
                            {d.date.split(',')[0]}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Rarity Spectrum Breakdown (1 column on lg) */}
              <div className="p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="type-eyebrow text-neutral-900 font-bold text-xs mb-1">
                    Rarity Tier Spectrum
                  </h2>
                  <p className="text-neutral-500 text-xs mb-4">
                    Demographic distribution of evaluated names
                  </p>

                  <div className="space-y-3">
                    {data.rarityBreakdown.map(r => (
                      <div key={r.label} className="text-xs">
                        <div className="flex justify-between items-center mb-1 font-medium">
                          <span className="text-neutral-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                            <span>{r.label}</span>
                          </span>
                          <span className="text-neutral-900 font-bold tabular-nums">
                            {r.percentage}% <span className="text-neutral-400 font-normal">({r.count})</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${r.percentage}%`, backgroundColor: r.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Statistical Benchmark</span>
                  <span className="font-semibold text-neutral-800">1+ Billion Records</span>
                </div>
              </div>
            </div>

            {/* Lower Grid: Leaderboard & Geographic & Live Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {/* Leaderboard: Top Searched Names */}
              <div className="p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="type-eyebrow text-neutral-900 font-bold text-xs">
                      Most Searched Names
                    </h2>
                    <p className="text-neutral-500 text-xs mt-0.5">
                      Top names queried by real visitors
                    </p>
                  </div>
                  <span className="text-lg">🏆</span>
                </div>

                <div className="divide-y divide-neutral-100 overflow-hidden">
                  {data.topNames.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      No names recorded in this period yet.
                    </div>
                  ) : (
                    data.topNames.map((item, idx) => (
                      <div key={item.name} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 text-center font-bold tabular-nums ${idx < 3 ? 'text-neutral-950 font-extrabold' : 'text-neutral-400'}`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-neutral-900 text-sm">{item.name}</span>
                            <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                              <span>{item.region === 'US' ? '🇺🇸 US' : item.region === 'EU' ? '🇪🇺 EU' : item.region === 'GLOBAL' ? '🌐 Global' : '🇮🇳 India'}</span>
                              {item.rank && <span>• Rank #{item.rank.toLocaleString('en-IN')}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`type-eyebrow px-2 py-0.5 rounded-full text-[9px] ${getRarityBadgeStyle(item.rarityLabel)}`}>
                            {item.rarityLabel}
                          </span>
                          <span className="font-bold text-neutral-800 tabular-nums bg-neutral-100 px-2 py-1 rounded-md text-[11px]">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Geographic Region Breakdown */}
              <div className="p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="type-eyebrow text-neutral-900 font-bold text-xs">
                        Geographic Breakdown
                      </h2>
                      <p className="text-neutral-500 text-xs mt-0.5">
                        Visitor search selections by region
                      </p>
                    </div>
                    <span className="text-lg">🗺️</span>
                  </div>

                  <div className="space-y-4">
                    {data.regionBreakdown.map(reg => (
                      <div key={reg.region} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                            <span className="text-base">{reg.flag}</span>
                            <span>{reg.name}</span>
                          </span>
                          <span className="text-neutral-900 font-bold tabular-nums">
                            {reg.percentage}% <span className="text-neutral-400 font-normal">({reg.count})</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                            style={{ width: `${reg.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real Share Channel Breakdown */}
                {data.shareChannels.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <p className="type-eyebrow text-neutral-900 font-bold text-[10px] mb-2 uppercase tracking-wider">
                      Share Channel Distribution
                    </p>
                    <div className="space-y-1.5">
                      {data.shareChannels.map(sc => (
                        <div key={sc.channel} className="flex justify-between items-center text-[11px]">
                          <span className="text-neutral-600">{sc.channel}</span>
                          <span className="font-semibold text-neutral-900 tabular-nums">
                            {sc.count} {sc.count === 1 ? 'share' : 'shares'} ({sc.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vercel Web Analytics Note */}
                <div className="mt-6 p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-neutral-600 text-[11px] leading-relaxed">
                  <strong className="text-neutral-900 font-semibold block mb-0.5">
                    ⚡ Integrated with Vercel Analytics
                  </strong>
                  Live device breakdown, bounce rates, and city locations are continuously tracked in your Vercel project console.
                </div>
              </div>

              {/* Live Activity Feed Stream */}
              <div className="p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h2 className="type-eyebrow text-neutral-900 font-bold text-xs">
                      Live Interaction Stream
                    </h2>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-semibold">{lastUpdated}</span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-neutral-100 pr-1 space-y-2">
                  {data.recentActivity.slice(0, 15).map(act => (
                    <div key={act.id} className="pt-2 flex items-start justify-between text-xs gap-2">
                      <div className="flex items-start gap-2">
                        <span className="text-base mt-0.5 shrink-0">
                          {act.type === 'search' ? '🔍' : act.type === 'share' ? '📸' : act.type === 'subscriber' ? '📬' : '👥'}
                        </span>
                        <div>
                          <p className="font-semibold text-neutral-900 leading-tight">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                            {act.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-neutral-400 block font-medium">
                          {act.timeAgo}
                        </span>
                        {act.tag && (
                          <span className="inline-block mt-0.5 text-[9px] font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {act.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Export & Data Controls Tray */}
            <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <p className="type-eyebrow text-neutral-900 font-bold text-xs">
                  Export Raw Demographic & Event Telemetry
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Download all real visitor and search events to Excel, Google Sheets, or Python pandas.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white type-eyebrow text-[11px] font-semibold rounded-xl transition-all cursor-pointer shadow-xs active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJson}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 type-eyebrow text-[11px] font-semibold rounded-xl transition-all cursor-pointer active:scale-98"
                >
                  Download JSON
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 border-t border-white/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-contrast-subtle mt-8">
        <p>
          © {new Date().getFullYear()} Name Rarity Analytics • Built by{' '}
          <a
            href="https://www.instagram.com/karansinghh.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-contrast-white hover:underline font-medium"
          >
            Karan Singh
          </a>
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-contrast-white hover:underline underline-offset-2">
            Rarity Calculator
          </Link>
          <Link href="/methodology" className="text-contrast-white hover:underline underline-offset-2">
            Methodology & Sources
          </Link>
          <Link href="/privacy" className="text-contrast-white hover:underline underline-offset-2">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
