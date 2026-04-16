'use client';
import React, { useCallback, useRef, useState } from 'react';
import {
  AlertTriangle, Camera, CheckCircle2, ChevronDown, ChevronUp,
  CloudOff, Cpu, Leaf, Loader2, RefreshCw, Sprout, Upload, X, Zap,
} from 'lucide-react';
import { cn, SEVERITY_META, TREATMENT_META, confidenceBadge } from '@component/lib/utils';
import type { WeedAnalysisResult } from '@component/types/crop.types';

function CoverageBar({ green, weed, bare }: { green: number; weed: number; bare: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex rounded-xl overflow-hidden h-5">
        <div className="bg-green-500 transition-all duration-700" style={{ width: `${green}%` }} title={`Crop ${green}%`} />
        <div className="bg-red-400 transition-all duration-700"   style={{ width: `${weed}%`  }} title={`Weed ${weed}%`}  />
        <div className="bg-amber-200 transition-all duration-700" style={{ width: `${bare}%`  }} title={`Bare ${bare}%`}  />
      </div>
      <div className="flex gap-3 text-[10px]">
        {[
          { color: 'bg-green-500', label: `Crop ${green}%`   },
          { color: 'bg-red-400',   label: `Weed ${weed}%`    },
          { color: 'bg-amber-200', label: `Bare soil ${bare}%` },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={cn('h-2 w-2 rounded-full flex-shrink-0', item.color)} />
            <span className="text-gray-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview,  setPreview]  = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFile(file);
  }, [onFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
        'flex flex-col items-center justify-center text-center p-8 min-h-[240px]',
        dragging ? 'border-green-500 bg-green-50 scale-[1.01]' : 'border-green-200 bg-green-50/40 hover:border-green-400 hover:bg-green-50',
      )}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {preview ? (
        <img src={preview} alt="Field preview" className="max-h-48 rounded-xl object-contain shadow-md" />
      ) : (
        <>
          <div className="h-16 w-16 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center mb-4">
            <Camera size={28} className="text-green-600" />
          </div>
          <p className="text-sm font-bold text-green-900 mb-1">Drop your field photo here</p>
          <p className="text-xs text-gray-500 mb-4">or click to browse — JPEG, PNG up to 15 MB</p>
          <div className="flex gap-2">
            <span className="bg-green-100 text-green-700 text-[10px] font-bold rounded-full px-3 py-1">📸 Field photo</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold rounded-full px-3 py-1">🚁 Drone image</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold rounded-full px-3 py-1">📱 Mobile snap</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Results display ──────────────────────────────────────────────────────────

function AnalysisResults({ result, onReset }: { result: WeedAnalysisResult; onReset: () => void }) {
  const [showClusters,    setShowClusters]    = useState(false);
  const [expandedWeed,    setExpandedWeed]    = useState<number | null>(null);
  const [expandedTreat,   setExpandedTreat]   = useState<number | null>(null);
  const s   = result.opencv_stats;
  const sev = SEVERITY_META[result.severity];

  return (
    <div className="space-y-5 animate-resultReveal">

      {/* ── Severity banner ── */}
      <div className={cn('rounded-2xl border p-5', sev.bg, sev.border)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0', sev.bg, 'border', sev.border)}>
              {result.severity === 'none' || result.severity === 'low'
                ? <CheckCircle2 size={20} className={sev.text} />
                : <AlertTriangle size={20} className={sev.text} />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className={cn('text-sm font-black', sev.text)}>Weed Severity: {sev.label}</p>
                <span className={cn('text-[10px] font-bold rounded-full px-2 py-0.5', sev.badge)}>{result.yield_loss_risk_pct} yield risk</span>
              </div>
              <p className={cn('text-xs leading-relaxed', sev.text)}>{result.urgency_note}</p>
            </div>
          </div>
          <button onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition flex-shrink-0">
            <RefreshCw size={12} /> New
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-3 leading-relaxed">{result.overall_summary}</p>
      </div>

      {/* ── Annotated image + coverage bar ── */}
      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">🔬 OpenCV Analysis — Annotated Field</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold bg-red-100 text-red-700 rounded-full px-2 py-0.5">🔴 Weed zones</span>
            <span className="text-[10px] font-bold bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">🟠 High density</span>
            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">W# = cluster ID</span>
          </div>
        </div>
        <img
          src={`data:image/jpeg;base64,${result.annotated_image_b64}`}
          alt="Annotated field with weed detection"
          className="w-full object-contain max-h-80"
        />
        <div className="px-4 py-4">
          <CoverageBar green={s.green_coverage_pct} weed={s.weed_coverage_pct} bare={s.bare_soil_pct} />
        </div>
      </div>

      {/* ── Pixel stats cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { icon: '🌿', label: 'Crop Cover',    value: `${s.green_coverage_pct}%`, sub: 'Healthy green',   accent: 'border-l-green-400'  },
          { icon: '🌱', label: 'Weed Cover',    value: `${s.weed_coverage_pct}%`,  sub: 'Non-crop pixels', accent: 'border-l-red-400'    },
          { icon: '🏜️', label: 'Bare Soil',     value: `${s.bare_soil_pct}%`,      sub: 'Exposed ground',  accent: 'border-l-amber-400'  },
          { icon: '🔵', label: 'Weed Clusters', value: `${s.weed_cluster_count}`,  sub: 'Detected zones',  accent: 'border-l-blue-400'   },
        ].map(c => (
          <div key={c.label} className={cn('rounded-2xl border border-gray-100 bg-white p-4 border-l-4', c.accent)}>
            <div className="text-xl mb-2">{c.icon}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{c.label}</p>
            <p className="text-[18px] font-black text-gray-900 mt-1">{c.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Cluster breakdown (collapsible) ── */}
      {s.clusters.length > 0 && (
        <div className="bg-white rounded-2xl border border-green-100">
          <button
            onClick={() => setShowClusters(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">📍 Weed Cluster Breakdown ({s.clusters.length} zones)</p>
            {showClusters ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
          </button>
          {showClusters && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {s.clusters.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="h-6 w-6 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-red-700">W{c.id}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(100, c.area_pct * 10)}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 tabular-nums w-10 text-right">{c.area_pct}%</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Position ({c.x}, {c.y}) · Size {c.width}×{c.height}px</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Weed identification ── */}
      {result.weeds_identified.length > 0 && (
        <div className="bg-white rounded-2xl border border-green-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">🌾 Weeds Identified by AI</p>
          <div className="space-y-2">
            {result.weeds_identified.map((w, i) => {
              const tm = SEVERITY_META[w.threat_level];
              const isExpanded = expandedWeed === i;
              return (
                <div key={i} className={cn('rounded-xl border transition-all', tm.bg, tm.border)}>
                  <button
                    onClick={() => setExpandedWeed(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
                    <div className={cn('h-2 w-2 rounded-full flex-shrink-0', tm.dot)} />
                    <p className={cn('text-xs font-bold flex-1', tm.text)}>{w.name}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={cn('text-[9px] font-bold rounded-md px-1.5 py-0.5', confidenceBadge(w.confidence))}>{w.confidence} conf.</span>
                      <span className={cn('text-[9px] font-bold rounded-md px-1.5 py-0.5', tm.badge)}>{w.threat_level}</span>
                      {isExpanded ? <ChevronUp size={12} className={tm.text} /> : <ChevronDown size={12} className={tm.text} />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className={cn('px-3 pb-3 text-[11px] leading-relaxed border-t pt-2', tm.border, tm.text)}>
                      {w.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Treatment recommendations ── */}
      <div className="bg-white rounded-2xl border border-green-100 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">💊 Treatment Recommendations</p>
        <div className="space-y-2">
          {result.treatments.map((t, i) => {
            const tm   = TREATMENT_META[t.type];
            const isEx = expandedTreat === i;
            return (
              <div key={i} className={cn('rounded-xl border transition-all', tm.bg, tm.border)}>
                <button
                  onClick={() => setExpandedTreat(isEx ? null : i)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
                  <span className="text-base flex-shrink-0">{tm.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-bold', tm.text)}>{t.product}</p>
                    <p className={cn('text-[10px] opacity-70', tm.text)}>{t.dose}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={cn('text-[9px] font-bold rounded-md px-1.5 py-0.5 capitalize', tm.badge)}>{t.type}</span>
                    {isEx ? <ChevronUp size={12} className={tm.text} /> : <ChevronDown size={12} className={tm.text} />}
                  </div>
                </button>
                {isEx && (
                  <div className={cn('px-3 pb-3 border-t pt-2 space-y-1.5', tm.border)}>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-gray-500 w-14 flex-shrink-0">Timing:</span>
                      <span className={cn('text-[10px]', tm.text)}>{t.timing}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold text-gray-500 w-14 flex-shrink-0">Notes:</span>
                      <span className={cn('text-[10px]', tm.text)}>{t.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Timing + reinspection ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="bg-sky-50 rounded-2xl border border-sky-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600 mb-2">⏰ Best Treatment Window</p>
          <p className="text-sm font-bold text-sky-900">{result.best_treatment_time}</p>
        </div>
        <div className="bg-violet-50 rounded-2xl border border-violet-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-2">🔄 Re-inspection In</p>
          <p className="text-sm font-bold text-violet-900">{result.reinspection_days} days</p>
          <p className="text-[10px] text-violet-500 mt-0.5">After treatment application</p>
        </div>
      </div>

      {/* ── Smart tips ── */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-3">⚡ Smart Weed Management Tips</p>
        <div className="space-y-2">
          {result.smart_tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2.5 border border-emerald-100">
              <Zap size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-emerald-900 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution */}
      <div className="flex items-center justify-center gap-2 py-1">
        <Cpu size={11} className="text-gray-300" />
        <p className="text-[10px] text-gray-300">OpenCV 4.x pixel analysis + Gemini Vision AI identification</p>
      </div>
    </div>
  );
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

const LOADING_STAGES = [
  { icon: '📸', label: 'Reading image',            detail: 'Decoding JPEG/PNG pixels'                  },
  { icon: '🔬', label: 'OpenCV HSV segmentation',  detail: 'Isolating weed pixels in HSV colour space' },
  { icon: '📐', label: 'Contour detection',        detail: 'Finding and measuring weed clusters'       },
  { icon: '🤖', label: 'Gemini Vision AI',         detail: 'Identifying weed species and treatments'   },
];

function AnalysisLoader() {
  const [stage, setStage] = React.useState(0);
  React.useEffect(() => {
    const timers = LOADING_STAGES.map((_, i) =>
      setTimeout(() => setStage(i), i * 2200)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-8">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-green-500 shadow-lg">
          <Sprout size={24} className="text-white" />
        </div>
        <h3 className="font-display text-lg font-black text-green-950">Analysing Your Field</h3>
        <p className="mt-1 text-xs text-green-500">OpenCV + Gemini Vision working together</p>
      </div>
      <div className="space-y-2.5">
        {LOADING_STAGES.map((s, i) => {
          const isDone   = i < stage;
          const isActive = i === stage;
          return (
            <div key={i} className={cn('rounded-xl border p-3 transition-all duration-300',
              isDone   ? 'border-green-200 bg-green-50'
              : isActive ? 'border-green-300 bg-green-50'
              : 'border-gray-100 bg-gray-50 opacity-40')}>
              <div className="flex items-center gap-3">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base',
                  isDone ? 'bg-green-100' : isActive ? 'bg-green-100' : 'bg-gray-100')}>
                  {isDone ? <CheckCircle2 size={16} className="text-green-600" /> : <span>{s.icon}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={cn('text-[13px] font-semibold',
                      isDone ? 'text-green-700' : isActive ? 'text-green-950' : 'text-gray-400')}>{s.label}</p>
                    {isDone   && <span className="text-[10px] font-bold text-green-500">Done</span>}
                    {isActive && <Loader2 size={12} className="animate-spin text-green-600" />}
                  </div>
                  {(isActive || isDone) && (
                    <p className={cn('text-[10px] mt-0.5', isDone ? 'text-green-500' : 'text-gray-400')}>{s.detail}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WeedDetection() {
  const [file,      setFile]      = useState<File | null>(null);
  const [crop,      setCrop]      = useState('');
  const [soilType,  setSoilType]  = useState('');
  const [location,  setLocation]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<WeedAnalysisResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  const handleAnalyse = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);

    try {
      const formData = new FormData();
      formData.append('image',     file);
      formData.append('crop',      crop      || 'Unknown');
      formData.append('soil_type', soilType  || 'Unknown');
      formData.append('location',  location  || '');

      const baseUrl = 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/weed-detection/analyse`, {
        method: 'POST',
        body:   formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }

      const data: WeedAnalysisResult = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setResult(null); setError(null);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        @keyframes resultReveal { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .animate-resultReveal { animation: resultReveal 0.45s cubic-bezier(.22,.68,0,1.2) both; }
      `}</style>
      <div className="font-body min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-6 pb-20">

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-emerald-500 shadow-xl">
              <span className="text-3xl">🌾</span>
            </div>
            <h1 className="font-display text-3xl font-black text-green-950 mb-1">Weed Detection</h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Upload a field photo — OpenCV maps every weed pixel, Gemini Vision identifies species and prescribes targeted treatment.
            </p>
          </div>

          {/* ── Show result ── */}
          {result && !loading && (
            <AnalysisResults result={result} onReset={handleReset} />
          )}

          {/* ── Loading ── */}
          {loading && <AnalysisLoader />}

          {/* ── Upload form ── */}
          {!result && !loading && (
            <div className="space-y-5">

              {/* Upload zone */}
              <UploadZone onFile={f => { setFile(f); setError(null); }} />

              {/* Field context inputs */}
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf size={15} className="text-green-600" />
                  <h3 className="font-bold text-sm text-green-900">Field Context <span className="text-gray-400 font-normal">(optional — improves accuracy)</span></h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Crop', value: crop,      set: setCrop,      placeholder: 'e.g. Tomato, Wheat',         icon: '🌱' },
                    { label: 'Soil', value: soilType,  set: setSoilType,  placeholder: 'e.g. Alluvial, Black, Clay', icon: '🟤' },
                    { label: 'Location', value: location, set: setLocation, placeholder: 'e.g. Nashik, Maharashtra', icon: '📍' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[10px] font-bold text-green-800 mb-1.5">{f.icon} {f.label}</label>
                      <input
                        type="text" value={f.value}
                        onChange={e => f.set(e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full h-10 rounded-xl border-[1.5px] border-green-200 bg-green-50/50 px-3 text-sm text-green-950 placeholder:text-gray-300 focus:outline-none focus:border-green-500 transition"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <CloudOff size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800"><span className="font-bold">Error:</span> {error}</p>
                </div>
              )}

              {/* Analyse button */}
              <button
                onClick={handleAnalyse}
                disabled={!file || loading}
                className={cn(
                  'w-full h-13 rounded-xl flex items-center justify-center gap-2',
                  'text-sm font-bold transition-all py-3.5',
                  'bg-gradient-to-r from-green-900 to-green-600 text-white shadow-lg shadow-green-800/25',
                  'hover:brightness-110 hover:-translate-y-0.5',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none',
                )}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Analysing…</>
                  : <><Upload size={16} /> Detect Weeds</>}
              </button>

              {/* How it works */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">⚙️ How it works</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: '📸', title: 'Upload',      desc: 'Field photo from phone, drone or camera'  },
                    { icon: '🔬', title: 'OpenCV',      desc: 'HSV segmentation maps every weed pixel'   },
                    { icon: '🤖', title: 'Gemini AI',   desc: 'Vision model identifies weed species'     },
                    { icon: '💊', title: 'Treatment',   desc: 'Targeted chemical & organic prescriptions' },
                  ].map(s => (
                    <div key={s.title} className="text-center">
                      <div className="text-2xl mb-1.5">{s.icon}</div>
                      <p className="text-xs font-bold text-gray-700">{s.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}