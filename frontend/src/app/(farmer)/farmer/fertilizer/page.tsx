'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@component/components/ui/input';
import { Label } from '@component/components/ui/label';
import { Loader2, MapPin, CloudOff, CheckCircle2, Cpu, FlaskConical, Thermometer, Leaf } from 'lucide-react';
import { SoilWeatherInput } from '@component/types/recommendation.types';
import { useRecommendCrop } from '@component/hooks/queries/useRecommendation';
import { useGeolocation } from '@component/hooks/useGeolocation';
import { useCurrentWeather } from '@component/hooks/queries/useWeather';

/* ─── Crop image map ─────────────────────────────────────────────────────── */
const CROP_IMAGES: Record<string, string> = {
  rice:      'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=500&q=80',
  wheat:     'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80',
  maize:     'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80',
  corn:      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80',
  cotton:    'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500&q=80',
  sugarcane: 'https://images.unsplash.com/photo-1624054354861-28d2e1ef70b1?w=500&q=80',
  mango:     'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&q=80',
  banana:    'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&q=80',
  grapes:    'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&q=80',
  apple:     'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500&q=80',
  tomato:    'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=500&q=80',
  potato:    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80',
  onion:     'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80',
  chickpea:  'https://images.unsplash.com/photo-1638440163456-7f9f34d37b27?w=500&q=80',
  lentil:    'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=500&q=80',
  default:   'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80',
};

function getCropImage(crop: string): string {
  const key = crop?.toLowerCase().trim();
  for (const [name, url] of Object.entries(CROP_IMAGES)) {
    if (key?.includes(name)) return url;
  }
  return CROP_IMAGES.default;
}

/* ─── Analysis stages ────────────────────────────────────────────────────── */
const ANALYSIS_STAGES = [
  {
    id: 'soil',
    icon: FlaskConical,
    label: 'Analysing soil nutrients',
    detail: 'Evaluating N·P·K ratios and pH balance',
    duration: 2500,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    barColor: 'bg-amber-500',
  },
  {
    id: 'weather',
    icon: Thermometer,
    label: 'Processing climate data',
    detail: 'Cross-referencing temperature, humidity & rainfall',
    duration: 3000,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    barColor: 'bg-sky-500',
  },
  {
    id: 'model',
    icon: Cpu,
    label: 'Running ML prediction model',
    detail: 'Matching 22 crop profiles against your conditions',
    duration: 3000,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    barColor: 'bg-violet-500',
  },
  {
    id: 'result',
    icon: Leaf,
    label: 'Finalising recommendation',
    detail: 'Verifying confidence score and generating insight',
    duration: 2500,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    barColor: 'bg-green-500',
  },
];

/* ─── Field config ───────────────────────────────────────────────────────── */
const inputFields = [
  {
    name: 'Nitrogen' as const,
    label: 'Nitrogen (N)',
    placeholder: '90',
    min: 0, max: 140,
    unit: 'kg/ha',
    emoji: '🌿',
    iconBg: 'bg-green-100',
  },
  {
    name: 'Phosphorus' as const,
    label: 'Phosphorus (P)',
    placeholder: '42',
    min: 5, max: 145,
    unit: 'kg/ha',
    emoji: '🧪',
    iconBg: 'bg-orange-100',
  },
  {
    name: 'Potassium' as const,
    label: 'Potassium (K)',
    placeholder: '43',
    min: 5, max: 205,
    unit: 'kg/ha',
    emoji: '⚗️',
    iconBg: 'bg-violet-100',
  },
  {
    name: 'Temperature' as const,
    label: 'Temperature',
    placeholder: '20.8',
    min: 8, max: 44,
    unit: '°C',
    emoji: '🌡️',
    iconBg: 'bg-red-100',
    weatherKey: 'temperature' as const,
  },
  {
    name: 'Humidity' as const,
    label: 'Humidity',
    placeholder: '82',
    min: 14, max: 100,
    unit: '%',
    emoji: '💧',
    iconBg: 'bg-sky-100',
    weatherKey: 'humidity' as const,
  },
  {
    name: 'pH_Value' as const,
    label: 'pH Value',
    placeholder: '6.5',
    min: 3.5, max: 9.9,
    unit: 'pH',
    emoji: '⚖️',
    iconBg: 'bg-yellow-100',
    step: 0.1,
  },
  {
    name: 'Rainfall' as const,
    label: 'Rainfall',
    placeholder: '202.9',
    min: 20, max: 300,
    unit: 'mm',
    emoji: '🌧️',
    iconBg: 'bg-blue-100',
  },
];

const WEATHER_FILLED_FIELDS = new Set<string>(['Temperature', 'Humidity']);

const tips = [
  'Use recent soil test results for NPK values',
  'Enter current or expected weather conditions',
  'pH value should be between 3.5 and 9.9',
  'Rainfall is measured in millimetres (mm)',
  'Temperature should be in Celsius (°C)',
  'Humidity is expressed as a percentage (%)',
];

/* ─── Analysis overlay component ─────────────────────────────────────────── */
function AnalysisOverlay({
  isVisible,
  apiDone,
  onComplete,
}: {
  isVisible: boolean;
  apiDone: boolean;
  onComplete: () => void;
}) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());

  const progressRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const onCompleteRef  = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // ← KEY FIX: keep a ref that the interval closure can read without going stale
  const apiDoneRef = useRef(apiDone);
  useEffect(() => { apiDoneRef.current = apiDone; }, [apiDone]);

  // ← When apiDone flips true while we're stuck at 90 on the last stage,
  //   clear the paused interval and re-run advanceStage so it finishes.
  const stuckRef       = useRef(false);   // true when progress is parked at 90
  const currentStageRef = useRef(0);

  useEffect(() => {
    if (apiDone && stuckRef.current) {
      stuckRef.current = false;
      if (progressRef.current) clearInterval(progressRef.current);
      // Small delay so the user sees the bar un-stick before flying to 100
      stageTimerRef.current = setTimeout(() => advanceLastStage(), 80);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiDone]);

  const advanceLastStage = () => {
    const s = ANALYSIS_STAGES.length - 1;
    let progress = 90; // resume from where we were stuck
    const tickInterval = 30;
    const increment = (tickInterval / 600) * 100; // fast finish ~600 ms

    progressRef.current = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressRef.current!);
        setStageProgress(100);
        setCompletedStages((prev) => new Set([...prev, s]));
        setTimeout(() => onCompleteRef.current(), 400);
        return;
      }
      setStageProgress(progress);
    }, tickInterval);
  };

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      setStageProgress(0);
      setCompletedStages(new Set());
      stuckRef.current = false;
      currentStageRef.current = 0;
      return;
    }

    let stage = 0;
    let progress = 0;
    const totalStages = ANALYSIS_STAGES.length;

    const advanceStage = (s: number) => {
      if (s >= totalStages) return;
      currentStageRef.current = s;

      const stageDuration = ANALYSIS_STAGES[s].duration;
      const tickInterval  = 30;
      const increment     = (tickInterval / stageDuration) * 100;
      const isLastStage   = s === totalStages - 1;

      progressRef.current = setInterval(() => {
        progress += increment;

        // On the last stage, cap at 90 until apiDoneRef is true
        const cap = (!isLastStage || apiDoneRef.current) ? 100 : 90;

        if (progress >= cap) {
          progress = cap;

          if (cap === 90 && isLastStage) {
            // Park here — the apiDone useEffect will resume us
            stuckRef.current = true;
            clearInterval(progressRef.current!);
            setStageProgress(90);
            return;
          }

          // cap === 100 → stage complete
          clearInterval(progressRef.current!);
          setCompletedStages((prev) => new Set([...prev, s]));
          setStageProgress(0);
          progress = 0;

          if (s < totalStages - 1) {
            stage = s + 1;
            setCurrentStage(stage);
            stageTimerRef.current = setTimeout(() => advanceStage(stage), 120);
          } else {
            setTimeout(() => onCompleteRef.current(), 400);
          }
          return;
        }

        setStageProgress(progress);
      }, tickInterval);
    };

    advanceStage(0);

    return () => {
      if (progressRef.current)   clearInterval(progressRef.current);
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-green-950/60 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-8 shadow-2xl shadow-green-900/30 mx-4">
        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-green-500 shadow-lg shadow-green-800/30">
            <span className="text-2xl">🌾</span>
          </div>
          <h3 className="font-display text-xl font-black text-green-950">
            Analysing Your Field
          </h3>
          <p className="mt-1 text-xs text-green-500">
            Our ML model is processing your soil &amp; climate data
          </p>
        </div>

        {/* Stages */}
        <div className="space-y-3">
          {ANALYSIS_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = completedStages.has(idx);
            const isActive = currentStage === idx && !isDone;
            const isPending = idx > currentStage;

            return (
              <div
                key={stage.id}
                className={[
                  'rounded-2xl border p-3.5 transition-all duration-300',
                  isDone
                    ? 'border-green-200 bg-green-50'
                    : isActive
                    ? `${stage.borderColor} ${stage.bgColor}`
                    : 'border-stone-100 bg-stone-50 opacity-40',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                      isDone
                        ? 'bg-green-100'
                        : isActive
                        ? stage.bgColor
                        : 'bg-stone-100',
                    ].join(' ')}
                  >
                    {isDone ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <Icon
                        size={15}
                        className={isActive ? `${stage.color} ${isActive ? 'animate-pulse' : ''}` : 'text-stone-400'}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={[
                          'text-[13px] font-semibold transition-colors',
                          isDone ? 'text-green-700' : isActive ? 'text-green-950' : 'text-stone-400',
                        ].join(' ')}
                      >
                        {stage.label}
                      </p>
                      {isDone && (
                        <span className="text-[10px] font-bold text-green-500">Done</span>
                      )}
                      {isActive && (
                        <span className="text-[10px] font-bold text-green-600 tabular-nums">
                          {Math.round(stageProgress)}%
                        </span>
                      )}
                    </div>

                    {(isActive || isDone) && (
                      <p className={`text-[11px] mt-0.5 ${isDone ? 'text-green-500' : 'text-stone-500'}`}>
                        {stage.detail}
                      </p>
                    )}

                    {isActive && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                        <div
                          className={`h-full rounded-full transition-all duration-75 ${stage.barColor}`}
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-[11px] text-stone-400">
          Comparing against 22 crop varieties · Regional database active
        </p>
      </div>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function CropRecommendation() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SoilWeatherInput>();

  const { mutate: recommendCrop, isPending, data, isSuccess, reset: resetMutation } = useRecommendCrop();

  // Analysis overlay state
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  /* ── Geolocation ──────────────────────────────────────────────────────── */
  const { lat, lon, loading: geoLoading, error: geoError } = useGeolocation();

  /* ── Weather query ────────────────────────────────────────────────────── */
  const {
    data: weather,
    isLoading: weatherLoading,
    isError: weatherError,
  } = useCurrentWeather(lat!, lon!, {
    enabled: !geoLoading && !!lat && !!lon,
  });

  /* ── Auto-fill weather ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!weather) return;
    setValue('Temperature', weather.temperature, { shouldValidate: true });
    setValue('Humidity',    weather.humidity,    { shouldValidate: true });
  }, [weather, setValue]);

  /* ── When API responds, mark done so overlay can finish ──────────────── */
  useEffect(() => {
    if (isSuccess && data) {
      setApiDone(true);
    }
  }, [isSuccess, data]);

  /* ── Overlay complete callback ────────────────────────────────────────── */
  const handleAnalysisComplete = () => {
    setShowAnalysis(false);
    setShowResult(true);
    // Scroll to result
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  /* ── Derived banner state ─────────────────────────────────────────────── */
  const isWeatherLoading = geoLoading || weatherLoading;
  const isWeatherFailed  = (!!geoError || weatherError) && !isWeatherLoading;
  const isWeatherFilled  = !!weather && !isWeatherLoading && !isWeatherFailed;

  const displayLocation = weather
    ? [weather.location, weather.region].filter(Boolean).join(', ')
    : null;

  const watchedTemp     = watch('Temperature');
  const watchedHumidity = watch('Humidity');
  const hasWeatherValues = watchedTemp !== undefined || watchedHumidity !== undefined;

  const clearWeatherFields = () => {
    setValue('Temperature', undefined as any);
    setValue('Humidity',    undefined as any);
  };

  const onSubmit = (formData: SoilWeatherInput) => {
    // Reset previous result
    setShowResult(false);
    setApiDone(false);
    resetMutation?.();

    // Show overlay first, then fire API
    setShowAnalysis(true);
    recommendCrop(formData);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        .grain::after {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease both; }

        @keyframes resultReveal {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-resultReveal { animation: resultReveal 0.6s cubic-bezier(.22,.68,0,1.2) both; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        .animate-pulse-slow { animation: pulse-slow 2.8s ease-in-out infinite; }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f0fdf4 25%, #dcfce7 50%, #f0fdf4 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* ── Analysis Overlay ── */}
      <AnalysisOverlay
        isVisible={showAnalysis}
        apiDone={apiDone}
        onComplete={handleAnalysisComplete}
      />

      <div className="font-body min-h-screen bg-gradient-to-br from-stone-50 via-green-50 to-amber-50">

        {/* ══ HERO ══ */}
        <div className="grain relative rounded-lg overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-green-500 px-4 pb-20 pt-14 text-center">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 -left-12 h-60 w-60 rounded-full bg-white/[0.04]" />
          <div className="absolute right-[18%] top-[30%] h-28 w-28 rounded-full bg-white/[0.03]" />

          <div className="relative z-10">
            <div className="mb-4 flex justify-center gap-4 text-lg opacity-50">
              {['🌾', '🌱', '🌿', '🍃', '🌾'].map((e, i) => <span key={i}>{e}</span>)}
            </div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-green-300">
              AI-Powered Agriculture
            </p>
            <h1 className="font-display mb-3 text-4xl font-black leading-[1.1] text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              Smart Crop<br />Recommendation
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-green-100/75">
              Enter your soil &amp; weather data to receive precision farming
              advice tailored to your field conditions.
            </p>

            {isWeatherFilled && (
              <div className="animate-slideUp mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <img
                  src={`https:${weather!.icon}`}
                  alt={weather!.condition}
                  className="h-6 w-6"
                />
                <span className="text-xs font-semibold text-white">
                  {weather!.condition} · {weather!.temperature}°C · {weather!.humidity}% humidity
                </span>
                <span className="text-xs text-white/60">
                  {weather!.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ══ MAIN ══ */}
        <div className="mx-auto max-w-5xl px-4 pb-20">

          {/* ── FORM CARD ── */}
          <div className="mt-8 rounded-2xl border border-green-100 bg-white p-6 shadow-2xl shadow-green-900/10 sm:p-10">

            <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-green-800 to-green-500" />
              <div>
                <h2 className="text-lg font-bold text-green-950">
                  Soil &amp; Weather Conditions
                </h2>
                <p className="mt-0.5 text-xs text-green-500">
                  Fill all 7 parameters for accurate prediction
                </p>
              </div>
            </div>

            {/* ── WEATHER BANNER ── */}
            {isWeatherLoading && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                <Loader2 size={15} className="animate-spin flex-shrink-0 text-sky-500" />
                <div>
                  <p className="text-sm font-semibold text-sky-800">Fetching live weather…</p>
                  <p className="text-xs text-sky-500">Temperature &amp; Humidity will be pre-filled automatically.</p>
                </div>
              </div>
            )}

            {isWeatherFilled && (
              <div className="animate-slideUp mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={`https:${weather!.icon}`} alt={weather!.condition} className="h-10 w-10 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="flex-shrink-0 text-green-600" />
                      <p className="text-sm font-semibold text-green-800 truncate">{displayLocation}</p>
                      <span className="rounded-full bg-green-200 px-2 py-0.5 text-[10px] font-bold text-green-800">Live</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-green-600">
                      <span>🌡️ {weather!.temperature}°C (feels {weather!.feels_like}°C)</span>
                      <span>💧 {weather!.humidity}% humidity</span>
                      <span>💨 {weather!.wind_speed} km/h {weather!.wind_direction}</span>
                      <span>☁️ {weather!.clouds}% cloud</span>
                      <span>👁 {weather!.visibility} km</span>
                    </div>
                    <p className="mt-1 text-xs text-green-500">Temperature &amp; Humidity pre-filled · Enter Rainfall manually</p>
                  </div>
                  {hasWeatherValues && (
                    <button type="button" onClick={clearWeatherFields} className="flex-shrink-0 self-start rounded-lg border border-green-200 bg-white px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {isWeatherFailed && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <CloudOff size={15} className="flex-shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Weather auto-fill unavailable</p>
                  <p className="text-xs text-amber-600">
                    {geoError
                      ? 'Location permission denied — please enter weather values manually.'
                      : 'Could not fetch weather data — please enter values manually.'}
                  </p>
                </div>
              </div>
            )}

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {inputFields.map((field) => {
                  const isAutoFilled = WEATHER_FILLED_FIELDS.has(field.name) && isWeatherFilled;
                  const isShimmering = WEATHER_FILLED_FIELDS.has(field.name) && isWeatherLoading;

                  return (
                    <div
                      key={field.name}
                      className={[
                        'group rounded-2xl border-[1.5px] p-4 transition-all duration-200',
                        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-100',
                        'focus-within:border-green-600 focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]',
                        errors[field.name]
                          ? 'border-red-300 bg-red-50'
                          : isAutoFilled
                          ? 'border-sky-200 bg-sky-50/40'
                          : 'border-green-100 bg-stone-50 hover:border-green-200',
                      ].join(' ')}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base ${field.iconBg}`}>
                          {field.emoji}
                        </span>
                        <Label htmlFor={field.name} className="cursor-pointer text-[13px] font-semibold text-green-900">
                          {field.label}
                        </Label>
                        {isAutoFilled && (
                          <span className="ml-auto rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sky-600">Live</span>
                        )}
                        {isShimmering && (
                          <span className="ml-auto rounded-md bg-green-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-500">…</span>
                        )}
                      </div>

                      <div className="relative">
                        {isShimmering ? (
                          <div className="shimmer h-10 w-full rounded-xl" />
                        ) : (
                          <Input
                            id={field.name}
                            type="number"
                            step={field.step ?? 1}
                            placeholder={field.placeholder}
                            {...register(field.name, {
                              required: `${field.label} is required`,
                              min: { value: field.min, message: `Min ${field.min}` },
                              max: { value: field.max, message: `Max ${field.max}` },
                              valueAsNumber: true,
                            })}
                            className={[
                              'h-10 pr-14 text-sm text-green-950 placeholder:text-green-300',
                              'rounded-xl border-[1.5px] bg-white',
                              'focus:border-green-600 focus:ring-0 focus:shadow-none',
                              errors[field.name] ? 'border-red-300' : isAutoFilled ? 'border-sky-200' : 'border-green-100',
                            ].join(' ')}
                          />
                        )}
                        {!isShimmering && (
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-green-600">
                            {field.unit}
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-[10px] text-green-400">Range: {field.min} – {field.max}</p>

                      {errors[field.name] && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                          ⚠ {errors[field.name]?.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending || showAnalysis}
                  className={[
                    'flex flex-1 items-center justify-center gap-2 rounded-xl',
                    'h-12 bg-gradient-to-r from-green-900 via-green-700 to-green-500',
                    'text-sm font-bold tracking-wide text-white shadow-lg shadow-green-800/30',
                    'transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-800/40',
                    'active:translate-y-0 active:brightness-100',
                    'disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0',
                  ].join(' ')}
                >
                  🌾 &nbsp;Get Crop Recommendation
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setShowResult(false);
                    resetMutation?.();
                  }}
                  className={[
                    'h-12 rounded-xl border-[1.5px] border-green-200 bg-white',
                    'px-6 text-sm font-semibold text-green-700',
                    'transition-all duration-200 hover:bg-green-50 hover:-translate-y-0.5 hover:border-green-400',
                    'active:translate-y-0',
                  ].join(' ')}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* ── RESULT CARD ── */}
          {showResult && data && (
            <div
              ref={resultRef}
              className="animate-resultReveal mt-6 overflow-hidden rounded-2xl border-[1.5px] border-green-200 bg-white shadow-2xl shadow-green-900/15"
            >
              <div className="h-[5px] bg-gradient-to-r from-green-950 via-green-600 to-lime-400" />
              <div className="grid grid-cols-[clamp(150px,32%,260px)_1fr]">
                <div className="group overflow-hidden">
                  <img
                    src={getCropImage(data.recommended_crop)}
                    alt={data.recommended_crop}
                    className="block h-full min-h-[200px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = CROP_IMAGES.default; }}
                  />
                </div>
                <div className="p-7">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-green-500">
                    ✅ Recommended Crop
                  </p>
                  <h2
                    className="font-display mb-3 capitalize leading-tight text-green-950"
                    style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}
                  >
                    {data.recommended_crop}
                  </h2>
                  <p className="mb-5 max-w-md text-sm leading-relaxed text-green-700">
                    {data.message}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Soil-matched', 'Climate-ready'].map((tag) => (
                      <span key={tag} className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        🌱 {tag}
                      </span>
                    ))}
                    <span className="animate-pulse-slow rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      🌱 AI-verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TIPS CARD ── */}
          <div className="mt-6 rounded-2xl border-[1.5px] border-yellow-200 bg-gradient-to-br from-amber-50 to-lime-50 p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h3 className="text-sm font-bold text-amber-900">Tips for Accurate Results</h3>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs leading-relaxed text-amber-800">
                  <span className="mt-0.5 font-bold text-green-600">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </>
  );
}