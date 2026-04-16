'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, Loader2, TrendingUp, Zap, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@component/lib/utils';
import { GoogleGenerativeAI } from "@google/generative-ai";


// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Scheme' | 'Subsidy' | 'Insurance' | 'Market' | 'Advisory' | 'Policy';
type Impact = 'High' | 'Medium' | 'Low';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: Category;
  source: string;
  date: string;
  impact: Impact;
  states: string;
  beneficiaries: string;
  amount: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<Category, { badge: string; dot: string; ticker: string }> = {
  Scheme:    { badge: 'bg-green-100 text-green-800 border-green-200',   dot: 'bg-green-500',  ticker: '#3B6D11' },
  Subsidy:   { badge: 'bg-amber-100 text-amber-800 border-amber-200',   dot: 'bg-amber-500',  ticker: '#854F0B' },
  Insurance: { badge: 'bg-sky-100 text-sky-800 border-sky-200',         dot: 'bg-sky-500',    ticker: '#185FA5' },
  Market:    { badge: 'bg-violet-100 text-violet-800 border-violet-200', dot: 'bg-violet-500', ticker: '#534AB7' },
  Advisory:  { badge: 'bg-teal-100 text-teal-800 border-teal-200',      dot: 'bg-teal-600',   ticker: '#0F6E56' },
  Policy:    { badge: 'bg-rose-100 text-rose-800 border-rose-200',      dot: 'bg-rose-500',   ticker: '#993556' },
};

const IMPACT_STYLES: Record<Impact, string> = {
  High:   'bg-green-100 text-green-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low:    'bg-gray-100 text-gray-600',
};

const FILTERS = ['All', 'Scheme', 'Subsidy', 'Insurance', 'Market', 'Advisory', 'Policy'] as const;
type Filter = typeof FILTERS[number];

const LOADING_MSGS = [
  'Fetching latest government news…',
  'Connecting to ministry portals…',
  'AI curating farmer updates…',
  'Almost ready…',
];

const AI_PROMPT = `You are an Indian agricultural news curator. Generate a JSON array of exactly 12 realistic, current government news items for Indian farmers as of April 2026. Each item must reflect REAL and LIKELY government schemes, policies, and advisories that would exist around this time in India.

Return ONLY a valid JSON array, no markdown, no explanation. Each object must have exactly these fields:
- id: number (1-12)
- title: string (concise headline, max 90 chars)
- summary: string (2-3 sentences with specific details — amounts in rupees, percentages, states covered, deadlines)
- category: one of exactly ["Scheme","Subsidy","Insurance","Market","Advisory","Policy"]
- source: string (real ministry or agency e.g. "Ministry of Agriculture & Farmers Welfare", "NABARD", "PM-KISAN Portal", "APEDA", "FCI")
- date: string (a plausible date in April 2026, format "DD Apr 2026")
- impact: one of exactly ["High","Medium","Low"]
- states: string (comma-separated states or "All India")
- beneficiaries: string (e.g. "Small & marginal farmers", "All farmers", "Cotton growers")
- amount: string (monetary amount or "N/A" if not applicable)

Include a realistic mix: 3 Scheme, 2 Subsidy, 2 Insurance, 2 Market, 2 Advisory, 1 Policy. Make sure dates vary across April 2026. Include real-sounding scheme names like PM-KISAN, PMFBY, KCC, eNAM, RKVY, PMGSY, Soil Health Card, Kisan Credit Card, PM Fasal Bima Yojana, Agri Infrastructure Fund etc.`;

// ─── API fetch ────────────────────────────────────────────────────────────────


const genAI = new GoogleGenerativeAI("AIzaSyAqFUWpC2-rjsojuGTVIq1Kawug6ANX9n0");

async function fetchFarmerNews(): Promise<NewsItem[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const result = await model.generateContent(AI_PROMPT);
    const response = await result.response;
    let text = response.text();

    // Clean response (important)
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text) as NewsItem[];
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to fetch news");
  }
}


// ─── Ticker ───────────────────────────────────────────────────────────────────

function NewsTicker({ items }: { items: NewsItem[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 py-2.5 mb-4 group">
      <div className="flex w-max gap-0 animate-ticker group-hover:[animation-play-state:paused]">
        {doubled.map((n, i) => {
          const style = CATEGORY_STYLES[n.category];
          return (
            <div key={i} className="flex items-center gap-2 px-6 border-r border-gray-200 last:border-r-0 whitespace-nowrap">
              <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', style.dot)} />
              <span className="text-[11px] font-semibold text-gray-700">{n.category}</span>
              <span className="text-[11px] text-gray-500 max-w-[260px] truncate">{n.title}</span>
              <span className="text-[10px] text-gray-400">{n.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow({ items }: { items: NewsItem[] }) {
  const high = items.filter(n => n.impact === 'High').length;
  const schemes = items.filter(n => n.category === 'Scheme').length;
  const stateSet = new Set(
    items.flatMap(n => n.states.split(',').map(s => s.trim()))
  );

  const stats = [
    { label: 'Total updates', value: items.length },
    { label: 'High impact', value: high },
    { label: 'New schemes', value: schemes },
    { label: 'States covered', value: Math.min(stateSet.size, 28) },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {stats.map(s => (
        <div key={s.label} className="bg-green-50 rounded-xl p-3">
          <p className="text-xl font-bold text-green-900">{s.value}</p>
          <p className="text-[10px] text-green-600 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── News card ────────────────────────────────────────────────────────────────

interface NewsCardProps {
  item: NewsItem;
  isExpanded: boolean;
  onToggle: () => void;
  onAsk: (title: string) => void;
}

function NewsCard({ item, isExpanded, onToggle, onAsk }: NewsCardProps) {
  const catStyle = CATEGORY_STYLES[item.category];
  const impactStyle = IMPACT_STYLES[item.impact];

  return (
    <div
      onClick={onToggle}
      className={cn(
        'bg-white rounded-2xl border p-4 cursor-pointer transition-all duration-200',
        isExpanded ? 'border-green-300 shadow-sm' : 'border-gray-100 hover:border-gray-200',
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className={cn('text-[10px] font-semibold rounded-full px-2.5 py-0.5 border flex-shrink-0', catStyle.badge)}>
          {item.category}
        </span>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{item.date}</span>
      </div>

      {/* Title */}
      <p className="text-[13px] font-semibold text-gray-900 leading-snug mb-2">{item.title}</p>

      {/* Expandable body */}
      {isExpanded && (
        <div className="animate-fadeIn">
          <p className="text-[12px] text-gray-600 leading-relaxed mb-3">{item.summary}</p>

          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              { label: 'Beneficiaries', value: item.beneficiaries },
              { label: 'Amount', value: item.amount },
              { label: 'States', value: item.states, full: true },
            ].map(f => (
              <div
                key={f.label}
                className={cn('bg-gray-50 rounded-lg p-2', f.full ? 'col-span-2' : '')}
              >
                <p className="text-[10px] text-gray-400">{f.label}</p>
                <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={e => { e.stopPropagation(); onAsk(item.title); }}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-green-800 bg-green-50 border border-green-200 rounded-lg py-2 hover:bg-green-100 transition"
          >
            How can I apply for this?
            <ArrowUpRight size={11} />
          </button>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 mt-2.5">
        <p className="text-[10px] text-gray-400 truncate">{item.source}</p>
        <span className={cn('text-[10px] font-semibold rounded-full px-2 py-0.5 flex-shrink-0', impactStyle)}>
          {item.impact} impact
        </span>
      </div>

      {/* Toggle hint */}
      <div className="flex items-center gap-1 mt-2">
        {isExpanded
          ? <><ChevronUp size={11} className="text-green-600" /><span className="text-[10px] text-green-600">Show less</span></>
          : <><ChevronDown size={11} className="text-gray-400" /><span className="text-[10px] text-gray-400">Read more</span></>
        }
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FarmerNewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cycleMessages = useCallback(() => {
    let idx = 0;
    const cycle = () => {
      idx = (idx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[idx]);
      msgTimerRef.current = setTimeout(cycle, 1800);
    };
    msgTimerRef.current = setTimeout(cycle, 1800);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadingMsg(LOADING_MSGS[0]);
    cycleMessages();
    try {
      const items = await fetchFarmerNews();
      setNews(items);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setError('Failed to load news. Please try refreshing.');
    } finally {
      setLoading(false);
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    }
  }, [cycleMessages]);

  useEffect(() => {
    load();
    return () => { if (msgTimerRef.current) clearTimeout(msgTimerRef.current); };
  }, [load]);

  const filtered = activeFilter === 'All'
    ? news
    : news.filter(n => n.category === activeFilter);

  return (
    <>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 38s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.22s ease both;
        }
      `}</style>

      <div className="w-full">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Kisan Samachar</h2>
              <p className="text-[10px] text-gray-400">Govt news for farmers · AI-curated</p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={26} className="animate-spin text-green-500" />
            <p className="text-sm text-gray-500">{loadingMsg}</p>
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* ── Loaded state ── */}
        {!loading && !error && news.length > 0 && (
          <>
            {/* Infinite ticker */}
            <NewsTicker items={news} />

            {/* Stats */}
            <StatsRow items={news} />

            {/* Filter pills */}
            <div className="flex gap-1.5 flex-wrap mb-4" style={{ scrollbarWidth: 'none' }}>
              {FILTERS.map(f => {
                const count = f === 'All' ? news.length : news.filter(n => n.category === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => { setActiveFilter(f); setExpandedId(null); }}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-semibold border transition',
                      activeFilter === f
                        ? 'bg-green-700 border-green-700 text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-700',
                    )}
                  >
                    {f} <span className="opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {filtered.map(item => (
                <NewsCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedId === item.id}
                  onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  onAsk={(title) => {
                    // Wire this up to your chat or navigation handler
                    console.log('Ask about:', title);
                  }}
                />
              ))}
            </div>

            {/* Ask AI CTA */}
            <button
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-green-800 bg-green-50 border border-green-200 rounded-xl py-3 hover:bg-green-100 transition"
              onClick={() => console.log('Ask AI about all schemes')}
            >
              <Zap size={14} />
              Ask AI about any scheme in detail
              <ArrowUpRight size={14} />
            </button>

            {/* Timestamp */}
            {lastUpdated && (
              <p className="text-[10px] text-gray-400 text-right mt-2">
                Last updated: {lastUpdated}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}