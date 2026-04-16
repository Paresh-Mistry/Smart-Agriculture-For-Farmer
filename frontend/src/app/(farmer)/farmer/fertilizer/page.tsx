'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2, ChevronLeft, ChevronRight, CloudOff,
  Cpu, Droplets, FlaskConical, Leaf, Loader2,
  MapPin, Navigation, RefreshCw, Sprout, Thermometer,
  TrendingUp, Zap, Info,
  Locate,
  ChevronDown,
} from 'lucide-react';
import { useRecommendCrop } from '@component/hooks/queries/useRecommendation';
import type { RecommendInput, CropResult } from '@component/types/recommendation.types';
import { useGeolocation } from '@component/hooks/useGeolocation';
import { useCurrentWeather } from '@component/hooks/queries/useWeather';
import { useCropDetails } from '@component/hooks/queries/useRecommendation';
import type { CropDetails } from '@component/types/crop.types';
import { cn } from '@component/lib/utils';

interface LocationPreset {
  id: string;
  name: string;
  state: string;
  zone: 'kharif' | 'rabi' | 'both' | 'perennial';
  zoneBadge: string;
  temp: number;
  humidity: number;
  rainfall: number;
  soilType: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  crops: string[];
}

const LOCATION_PRESETS = [
  {
    id: 'punjab-ludhiana', name: 'Ludhiana', state: 'Punjab',
    zone: 'rabi', zoneBadge: 'Rabi zone',
    temp: 20, humidity: 65, rainfall: 54,
    soilType: 'Alluvial', nitrogen: 80, phosphorus: 45, potassium: 60, ph: 7.5,
    crops: ['Wheat', 'Rice', 'Maize', 'Sunflower'],
  },
  {
    id: 'maharashtra-nashik', name: 'Nashik', state: 'Maharashtra',
    zone: 'both', zoneBadge: 'Both seasons',
    temp: 25, humidity: 60, rainfall: 67,
    soilType: 'Black', nitrogen: 55, phosphorus: 35, potassium: 50, ph: 7.2,
    crops: ['Grapes', 'Onion', 'Tomato', 'Sugarcane'],
  },
  {
    id: 'up-varanasi', name: 'Varanasi', state: 'Uttar Pradesh',
    zone: 'both', zoneBadge: 'Both seasons',
    temp: 28, humidity: 70, rainfall: 83,
    soilType: 'Alluvial', nitrogen: 65, phosphorus: 40, potassium: 60, ph: 7.0,
    crops: ['Wheat', 'Rice', 'Mustard', 'Potato'],
  },
  {
    id: 'telangana-warangal', name: 'Warangal', state: 'Telangana',
    zone: 'kharif', zoneBadge: 'Kharif zone',
    temp: 30, humidity: 75, rainfall: 92,
    soilType: 'Red', nitrogen: 45, phosphorus: 30, potassium: 45, ph: 6.5,
    crops: ['Cotton', 'Rice', 'Maize', 'Red Gram'],
  },
  {
    id: 'gujarat-anand', name: 'Anand', state: 'Gujarat',
    zone: 'both', zoneBadge: 'Both seasons',
    temp: 29, humidity: 60, rainfall: 63,
    soilType: 'Loamy', nitrogen: 50, phosphorus: 35, potassium: 50, ph: 7.8,
    crops: ['Groundnut', 'Cotton', 'Wheat', 'Tobacco'],
  },
  {
    id: 'karnataka-dharwad', name: 'Dharwad', state: 'Karnataka',
    zone: 'kharif', zoneBadge: 'Kharif zone',
    temp: 26, humidity: 70, rainfall: 75,
    soilType: 'Black', nitrogen: 40, phosphorus: 25, potassium: 45, ph: 6.8,
    crops: ['Sorghum', 'Chickpea', 'Sunflower', 'Cotton'],
  },
  {
    id: 'rajasthan-kota', name: 'Kota', state: 'Rajasthan',
    zone: 'rabi', zoneBadge: 'Rabi zone',
    temp: 30, humidity: 45, rainfall: 54,
    soilType: 'Sandy', nitrogen: 30, phosphorus: 20, potassium: 35, ph: 8.2,
    crops: ['Mustard', 'Coriander', 'Wheat', 'Chickpea'],
  },
  {
    id: 'wb-murshidabad', name: 'Murshidabad', state: 'West Bengal',
    zone: 'kharif', zoneBadge: 'Kharif zone',
    temp: 28, humidity: 85, rainfall: 117,
    soilType: 'Alluvial', nitrogen: 70, phosphorus: 45, potassium: 65, ph: 6.5,
    crops: ['Rice', 'Jute', 'Mustard', 'Potato'],
  },
  {
    id: 'kerala-palakkad', name: 'Palakkad', state: 'Kerala',
    zone: 'perennial', zoneBadge: 'Perennial',
    temp: 31, humidity: 80, rainfall: 167,
    soilType: 'Red', nitrogen: 45, phosphorus: 30, potassium: 50, ph: 5.8,
    crops: ['Banana', 'Coconut', 'Rice', 'Turmeric'],
  },
  {
    id: 'mp-hoshangabad', name: 'Hoshangabad', state: 'Madhya Pradesh',
    zone: 'rabi', zoneBadge: 'Rabi zone',
    temp: 26, humidity: 60, rainfall: 92,
    soilType: 'Black', nitrogen: 60, phosphorus: 40, potassium: 55, ph: 7.3,
    crops: ['Wheat', 'Soybean', 'Chickpea', 'Lentil'],
  },
  {
    id: 'haryana-karnal', name: 'Karnal', state: 'Haryana',
    zone: 'rabi', zoneBadge: 'Rabi zone',
    temp: 22, humidity: 60, rainfall: 58,
    soilType: 'Alluvial', nitrogen: 75, phosphorus: 40, potassium: 60, ph: 7.4,
    crops: ['Wheat', 'Rice', 'Sugarcane', 'Barley'],
  },
  {
    id: 'andhra-guntur', name: 'Guntur', state: 'Andhra Pradesh',
    zone: 'kharif', zoneBadge: 'Kharif zone',
    temp: 32, humidity: 75, rainfall: 75,
    soilType: 'Black', nitrogen: 42, phosphorus: 28, potassium: 45, ph: 6.6,
    crops: ['Chilli', 'Cotton', 'Tobacco', 'Maize'],
  },
];


const ZONE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'kharif', label: 'Kharif' },
  { id: 'rabi', label: 'Rabi' },
  { id: 'both', label: 'Both' },
  { id: 'perennial', label: 'Perennial' },
] as const;


interface LocationSidebarProps {
  onSelect: (preset: LocationPreset) => void;
  selectedPresetId: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

const ZONE_STYLES: Record<string, { badge: string; dot: string }> = {
  kharif: { badge: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' },
  rabi: { badge: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  both: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  perennial: { badge: 'bg-violet-100 text-violet-800 border-violet-200', dot: 'bg-violet-500' },
};

function LocationSidebar({ onSelect, selectedPresetId, isOpen, onToggle }: LocationSidebarProps) {
  const [activeZone, setActiveZone] = useState<string>('all');

  const filtered = activeZone === 'all'
    ? LOCATION_PRESETS
    : LOCATION_PRESETS.filter(l => l.zone === activeZone);

  return (
    <>
      {/* ── Mobile toggle button ── */}
      <button
        onClick={onToggle}
        className={cn(
          'lg:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-lg transition-all',
          isOpen
            ? 'bg-green-700 text-white'
            : 'bg-white text-green-800 border border-green-200 shadow-green-100',
        )}
      >
        <Locate size={14} />
        {isOpen ? 'Hide locations' : 'Quick locations'}
      </button>

      {/* ── Overlay for mobile ── */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={cn(
          // Desktop: always visible fixed sidebar
          'lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-shrink-0 lg:translate-x-0 lg:block',
          // Mobile: bottom sheet slide-up
          'fixed bottom-0 left-0 right-0 z-40 lg:static lg:z-auto',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0',
        )}
      >
        <div className={cn(
          'bg-white border-green-100 flex flex-col',
          // Mobile: rounded top, max-height
          'rounded-t-3xl border-t border-x max-h-[70vh]',
          // Desktop: full height, left border
          'lg:rounded-none lg:max-h-screen lg:h-screen lg:border-t-0 lg:border-x-0 lg:border-r',
        )}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-100 flex-shrink-0">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Quick Select</p>
              <h2 className="text-sm font-bold text-green-950">Popular Farming Zones</h2>
            </div>
            <button onClick={onToggle} className="lg:hidden text-gray-400 hover:text-gray-600">
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Helper text */}
          <div className="px-4 py-2.5 bg-green-50 border-b border-green-100 flex-shrink-0">
            <p className="text-[11px] text-green-700 leading-relaxed">
              Tap a location to instantly fill soil type, NPK values & weather data. You can still edit them after.
            </p>
          </div>

          {/* Zone filters */}
          <div className="flex gap-1.5 px-3 py-2.5 border-b border-green-100 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
            {ZONE_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveZone(f.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition flex-shrink-0',
                  activeZone === f.id
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Location cards list */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
            {filtered.map(loc => {
              const zoneStyle = ZONE_STYLES[loc.zone];
              const isSelected = selectedPresetId === loc.id;

              return (
                <button
                  key={loc.id}
                  onClick={() => { onSelect(loc); onToggle(); }}
                  className={cn(
                    'w-full text-left rounded-xl border p-3 transition-all duration-150',
                    isSelected
                      ? 'bg-green-50 border-green-300 shadow-sm'
                      : 'bg-white border-gray-100 hover:border-green-200 hover:bg-green-50/40',
                  )}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {isSelected && <CheckCircle2 size={11} className="text-green-600 flex-shrink-0" />}
                        <p className={cn('text-[13px] font-bold leading-tight', isSelected ? 'text-green-800' : 'text-gray-900')}>
                          {loc.name}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{loc.state}</p>
                    </div>
                    <span className={cn('text-[9px] font-bold rounded-full px-2 py-0.5 border flex-shrink-0', zoneStyle.badge)}>
                      {loc.zoneBadge}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {[
                      { label: 'Temp', value: `${loc.temp}°C` },
                      { label: 'Rain', value: `${loc.rainfall}mm` },
                      { label: 'Soil', value: loc.soilType },
                    ].map(stat => (
                      <div key={stat.label} className="bg-gray-50 rounded-lg px-2 py-1.5">
                        <p className="text-[9px] text-gray-400">{stat.label}</p>
                        <p className="text-[11px] font-bold text-gray-800">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* NPK row */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 flex-shrink-0">NPK</span>
                    {[
                      { label: 'N', value: loc.nitrogen, color: 'bg-lime-100 text-lime-800' },
                      { label: 'P', value: loc.phosphorus, color: 'bg-orange-100 text-orange-800' },
                      { label: 'K', value: loc.potassium, color: 'bg-sky-100 text-sky-800' },
                    ].map(n => (
                      <span key={n.label} className={cn('text-[9px] font-bold rounded px-1.5 py-0.5', n.color)}>
                        {n.label}:{n.value}
                      </span>
                    ))}
                    <span className="text-[9px] font-bold bg-violet-100 text-violet-800 rounded px-1.5 py-0.5">
                      pH:{loc.ph}
                    </span>
                  </div>

                  {/* Crop pills */}
                  <div className="flex flex-wrap gap-1">
                    {loc.crops.map(crop => (
                      <span key={crop} className="text-[9px] bg-white border border-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                        {crop}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2.5 border-t border-green-100 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center">
              {LOCATION_PRESETS.length} zones · Data from ICAR & State Agri Depts
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Crop catalogue ──────────────────────────────────────────────────────────

interface CropEntry { id: string; name: string; emoji: string; season: string; duration: string; }
interface CropCategoryDef {
  id: string; label: string; icon: string;
  accent: string; bg: string; border: string;
  crops: CropEntry[];
}

const CROP_CATEGORIES: CropCategoryDef[] = [
  {
    id: 'Pulses', label: 'Pulses', icon: '🫘',
    accent: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-200',
    crops: [
      { id: 'Lentil', name: 'Lentil', emoji: '🟤', season: 'Rabi', duration: '80–110 days' },
      { id: 'Black Gram', name: 'Black Gram', emoji: '⚫', season: 'Kharif', duration: '60–90 days' },
      { id: 'Chickpea', name: 'Chickpea', emoji: '🫘', season: 'Rabi', duration: '90–100 days' },
      { id: 'Moong', name: 'Moong Dal', emoji: '🟢', season: 'Kharif', duration: '60–70 days' },
      { id: 'Red Gram', name: 'Red Gram', emoji: '🔴', season: 'Kharif', duration: '150–180 days' },
      { id: 'Cowpea', name: 'Cowpea', emoji: '🟡', season: 'Kharif', duration: '60–90 days' },
      { id: 'Horse Gram', name: 'Horse Gram', emoji: '🟫', season: 'Rabi', duration: '90–120 days' },
    ],
  },
  {
    id: 'Vegetables', label: 'Vegetables', icon: '🥦',
    accent: 'text-green-800', bg: 'bg-green-50', border: 'border-green-200',
    crops: [
      { id: 'Tomato', name: 'Tomato', emoji: '🍅', season: 'Both', duration: '60–80 days' },
      { id: 'Onion', name: 'Onion', emoji: '🧅', season: 'Rabi', duration: '90–120 days' },
      { id: 'Potato', name: 'Potato', emoji: '🥔', season: 'Rabi', duration: '80–100 days' },
      { id: 'Cabbage', name: 'Cabbage', emoji: '🥬', season: 'Rabi', duration: '60–90 days' },
      { id: 'Carrot', name: 'Carrot', emoji: '🥕', season: 'Rabi', duration: '70–90 days' },
      { id: 'Spinach', name: 'Spinach', emoji: '🌿', season: 'Rabi', duration: '30–45 days' },
      { id: 'Beans', name: 'Beans', emoji: '🫛', season: 'Both', duration: '50–65 days' },
      { id: 'Brinjal', name: 'Brinjal', emoji: '🍆', season: 'Both', duration: '70–90 days' },
      { id: 'Chilli', name: 'Chilli', emoji: '🌶️', season: 'Both', duration: '90–120 days' },
      { id: 'Cauliflower', name: 'Cauliflower', emoji: '🥦', season: 'Rabi', duration: '60–90 days' },
      { id: 'Okra', name: 'Okra', emoji: '🫑', season: 'Kharif', duration: '50–60 days' },
      { id: 'Cucumber', name: 'Cucumber', emoji: '🥒', season: 'Both', duration: '50–70 days' },
    ],
  },
  {
    id: 'Fruits', label: 'Fruits', icon: '🍎',
    accent: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-200',
    crops: [
      { id: 'Mango', name: 'Mango', emoji: '🥭', season: 'Perennial', duration: '3–5 yrs' },
      { id: 'Banana', name: 'Banana', emoji: '🍌', season: 'Perennial', duration: '10–12 mo' },
      { id: 'Grapes', name: 'Grapes', emoji: '🍇', season: 'Perennial', duration: '2–3 yrs' },
      { id: 'Guava', name: 'Guava', emoji: '🍐', season: 'Perennial', duration: '2–3 yrs' },
      { id: 'Apple', name: 'Apple', emoji: '🍎', season: 'Perennial', duration: '4–5 yrs' },
      { id: 'Orange', name: 'Orange', emoji: '🍊', season: 'Perennial', duration: '3–5 yrs' },
      { id: 'Papaya', name: 'Papaya', emoji: '🍈', season: 'Perennial', duration: '9–12 mo' },
      { id: 'Pomegranate', name: 'Pomegranate', emoji: '🍑', season: 'Perennial', duration: '2–3 yrs' },
      { id: 'Watermelon', name: 'Watermelon', emoji: '🍉', season: 'Summer', duration: '70–90 days' },
      { id: 'Strawberry', name: 'Strawberry', emoji: '🍓', season: 'Rabi', duration: '4–6 mo' },
    ],
  },
  {
    id: 'Cereals', label: 'Cereals & Grains', icon: '🌾',
    accent: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200',
    crops: [
      { id: 'Wheat', name: 'Wheat', emoji: '🌾', season: 'Rabi', duration: '100–130 days' },
      { id: 'Rice', name: 'Rice', emoji: '🍚', season: 'Kharif', duration: '90–150 days' },
      { id: 'Maize', name: 'Maize', emoji: '🌽', season: 'Kharif', duration: '80–110 days' },
      { id: 'Sorghum', name: 'Sorghum', emoji: '🌾', season: 'Kharif', duration: '90–110 days' },
      { id: 'Bajra', name: 'Bajra', emoji: '🌾', season: 'Kharif', duration: '65–90 days' },
      { id: 'Barley', name: 'Barley', emoji: '🌾', season: 'Rabi', duration: '90–110 days' },
    ],
  },
  {
    id: 'Cash Crops', label: 'Cash Crops', icon: '💰',
    accent: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200',
    crops: [
      { id: 'Sugarcane', name: 'Sugarcane', emoji: '🎋', season: 'Annual', duration: '12–18 mo' },
      { id: 'Cotton', name: 'Cotton', emoji: '🌿', season: 'Kharif', duration: '150–180 days' },
      { id: 'Sunflower', name: 'Sunflower', emoji: '🌻', season: 'Both', duration: '85–95 days' },
      { id: 'Groundnut', name: 'Groundnut', emoji: '🥜', season: 'Kharif', duration: '90–130 days' },
      { id: 'Mustard', name: 'Mustard', emoji: '🌼', season: 'Rabi', duration: '90–110 days' },
    ],
  },
  {
    id: 'Spices', label: 'Spices & Herbs', icon: '🌿',
    accent: 'text-teal-800', bg: 'bg-teal-50', border: 'border-teal-200',
    crops: [
      { id: 'Turmeric', name: 'Turmeric', emoji: '🟡', season: 'Kharif', duration: '7–9 months' },
      { id: 'Ginger', name: 'Ginger', emoji: '🫚', season: 'Kharif', duration: '8–10 months' },
      { id: 'Garlic', name: 'Garlic', emoji: '🧄', season: 'Rabi', duration: '120–150 days' },
      { id: 'Coriander', name: 'Coriander', emoji: '🌿', season: 'Rabi', duration: '60–90 days' },
      { id: 'Cumin', name: 'Cumin', emoji: '🌿', season: 'Rabi', duration: '90–110 days' },
      { id: 'Fenugreek', name: 'Fenugreek', emoji: '🌿', season: 'Rabi', duration: '90–100 days' },
    ],
  },
];

const SOIL_TYPES = [
  { id: 'Alluvial', label: 'Alluvial', emoji: '🏔️', desc: 'Fertile river deposits' },
  { id: 'Sandy', label: 'Sandy', emoji: '🏜️', desc: 'Light, well-draining' },
  { id: 'Red', label: 'Red', emoji: '🔴', desc: 'Iron-rich, slightly acidic' },
  { id: 'Clay', label: 'Clay', emoji: '🟤', desc: 'Heavy, water-retentive' },
  { id: 'Black', label: 'Black', emoji: '⚫', desc: 'Deep, moisture-retaining' },
  { id: 'Loamy', label: 'Loamy', emoji: '🌿', desc: 'Ideal balanced texture' },
];

const FIELD_UNITS = ['acre', 'hectare', 'bigha'] as const;
type FieldUnit = typeof FIELD_UNITS[number];

const STEPS = [
  { label: 'Crop', icon: '🌾' },
  { label: 'Field', icon: '📐' },
  { label: 'Weather', icon: '🌤️' },
  { label: 'Result', icon: '📋' },
];

// ─── Crop images ──────────────────────────────────────────────────────────────

const CROP_IMAGES: Record<string, string> = {
  tomato: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',
  onion: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
  cabbage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80',
  carrot: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&q=80',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80',
  beans: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80',
  brinjal: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=600&q=80',
  chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80',
  cauliflower: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&q=80',
  okra: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80',
  cucumber: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80',
  banana: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600&q=80',
  grapes: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=600&q=80',
  guava: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80',
  papaya: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=600&q=80',
  pomegranate: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=600&q=80',
  watermelon: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=600&q=80',
  strawberry: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80',
  chickpea: 'https://images.unsplash.com/photo-1638440163456-7f9f34d37b27?w=600&q=80',
  lentil: 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=600&q=80',
  'black gram': 'https://images.unsplash.com/photo-1514542863293-a79de63a0ab6?w=600&q=80',
  moong: 'https://images.unsplash.com/photo-1638440163456-7f9f34d37b27?w=600&q=80',
  'red gram': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
  cowpea: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
  'horse gram': 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=600&q=80',
  wheat: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
  rice: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80',
  maize: 'https://images.unsplash.com/photo-1601593768799-76d6e2a38f3c?w=600&q=80',
  sorghum: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
  bajra: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
  barley: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
  sugarcane: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80',
  cotton: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&q=80',
  sunflower: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80',
  groundnut: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
  mustard: 'https://images.unsplash.com/photo-1585744346878-ade20cd87ebb?w=600&q=80',
  turmeric: 'https://images.unsplash.com/photo-1611689342806-0863700e1414?w=600&q=80',
  ginger: 'https://images.unsplash.com/photo-1573414404851-f2f0d0c7e8ea?w=600&q=80',
  garlic: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&q=80',
  coriander: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80',
  cumin: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80',
  fenugreek: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80',
};

function getCropImage(crop: string): string {
  return CROP_IMAGES[crop.toLowerCase()] ?? CROP_IMAGES.default;
}

// ─── Analysis overlay ─────────────────────────────────────────────────────────

const ANALYSIS_STAGES = [
  { id: 'soil', icon: FlaskConical, label: 'Analysing soil nutrients', detail: 'Evaluating N·P·K ratios and pH balance', duration: 2200, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' },
  { id: 'weather', icon: Thermometer, label: 'Processing climate data', detail: 'Cross-referencing temperature, humidity & rainfall', duration: 2800, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', bar: 'bg-sky-500' },
  { id: 'model', icon: Cpu, label: 'Running ML prediction model', detail: 'Matching 22 crop profiles against your conditions', duration: 2800, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', bar: 'bg-violet-500' },
  { id: 'result', icon: Leaf, label: 'Generating cultivation guide', detail: 'AI agronomist tailoring advice to your exact setup', duration: 2000, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500' },
];

function AnalysisOverlay({ isVisible, apiDone, onComplete }: {
  isVisible: boolean; apiDone: boolean; onComplete: () => void;
}) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const apiDoneRef = useRef(apiDone);
  useEffect(() => { apiDoneRef.current = apiDone; }, [apiDone]);
  const stuckRef = useRef(false);

  useEffect(() => {
    if (apiDone && stuckRef.current) {
      stuckRef.current = false;
      if (progressRef.current) clearInterval(progressRef.current);
      let p = 90;
      progressRef.current = setInterval(() => {
        p += (30 / 500) * 100;
        if (p >= 100) {
          p = 100; clearInterval(progressRef.current!);
          setStageProgress(100);
          setCompletedStages(prev => new Set([...prev, ANALYSIS_STAGES.length - 1]));
          setTimeout(() => onCompleteRef.current(), 400);
          return;
        }
        setStageProgress(p);
      }, 30);
    }
  }, [apiDone]);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0); setStageProgress(0);
      setCompletedStages(new Set()); stuckRef.current = false;
      return;
    }
    let stage = 0; let progress = 0;
    const total = ANALYSIS_STAGES.length;

    const advanceStage = (s: number) => {
      if (s >= total) return;
      const { duration } = ANALYSIS_STAGES[s];
      const tick = 30; const inc = (tick / duration) * 100;
      const isLast = s === total - 1;

      progressRef.current = setInterval(() => {
        progress += inc;
        const cap = (!isLast || apiDoneRef.current) ? 100 : 90;
        if (progress >= cap) {
          progress = cap;
          if (cap === 90 && isLast) {
            stuckRef.current = true;
            clearInterval(progressRef.current!);
            setStageProgress(90); return;
          }
          clearInterval(progressRef.current!);
          setCompletedStages(prev => new Set([...prev, s]));
          setStageProgress(0); progress = 0;
          if (s < total - 1) {
            stage = s + 1; setCurrentStage(stage);
            stageTimerRef.current = setTimeout(() => advanceStage(stage), 120);
          } else {
            setTimeout(() => onCompleteRef.current(), 400);
          }
          return;
        }
        setStageProgress(progress);
      }, tick);
    };

    advanceStage(0);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-950/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl border border-green-100 bg-white p-8 shadow-2xl mx-4">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-green-500 shadow-lg">
            <span className="text-2xl">🌾</span>
          </div>
          <h3 className="font-display text-xl font-black text-green-950">Analysing Your Field</h3>
          <p className="mt-1 text-xs text-green-500">ML model + AI agronomist working on your data</p>
        </div>
        <div className="space-y-3">
          {ANALYSIS_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = completedStages.has(idx);
            const isActive = currentStage === idx && !isDone;
            return (
              <div key={stage.id} className={cn('rounded-2xl border p-3.5 transition-all duration-300',
                isDone ? 'border-green-200 bg-green-50' : isActive ? `${stage.border} ${stage.bg}` : 'border-stone-100 bg-stone-50 opacity-40')}>
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 transition-all',
                    isDone ? 'bg-green-100' : isActive ? stage.bg : 'bg-stone-100')}>
                    {isDone
                      ? <CheckCircle2 size={16} className="text-green-600" />
                      : <Icon size={15} className={isActive ? `${stage.color} animate-pulse` : 'text-stone-400'} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-[13px] font-semibold', isDone ? 'text-green-700' : isActive ? 'text-green-950' : 'text-stone-400')}>{stage.label}</p>
                      {isDone && <span className="text-[10px] font-bold text-green-500">Done</span>}
                      {isActive && <span className="text-[10px] font-bold text-green-600 tabular-nums">{Math.round(stageProgress)}%</span>}
                    </div>
                    {(isActive || isDone) && <p className={cn('text-[11px] mt-0.5', isDone ? 'text-green-500' : 'text-stone-500')}>{stage.detail}</p>}
                    {isActive && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
                        <div className={cn('h-full rounded-full transition-all duration-75', stage.bar)} style={{ width: `${stageProgress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-center text-[11px] text-stone-400">Comparing 22+ crop varieties · AI guide generation in progress</p>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accentLeft }: {
  icon: string; label: string; value: string; sub?: string; accentLeft: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-gray-100 bg-white p-4 border-l-4', accentLeft)}>
      <div className="text-xl mb-2">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-tight">{label}</p>
      <p className="text-[15px] font-bold text-gray-900 mt-1 leading-snug">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SeverityDot({ s }: { s: 'high' | 'medium' | 'low' }) {
  return <span className={cn('inline-block h-2 w-2 rounded-full flex-shrink-0 mt-0.5',
    s === 'high' ? 'bg-red-500' : s === 'medium' ? 'bg-amber-500' : 'bg-green-500')} />;
}
function severityBadge(s: 'high' | 'medium' | 'low') {
  return s === 'high' ? 'bg-red-50 border-red-200 text-red-800'
    : s === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-800'
      : 'bg-green-50 border-green-200 text-green-800';
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 border-l-4 border-l-gray-200 space-y-2">
            <div className="h-6 w-6 bg-gray-100 rounded-lg" />
            <div className="h-2.5 w-20 bg-gray-100 rounded-full" />
            <div className="h-4 w-full bg-gray-100 rounded-full" />
            <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <Loader2 size={20} className="animate-spin text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-900">Generating your personalised cultivation guide…</p>
          <p className="text-xs text-emerald-600 mt-0.5">AI agronomist tailoring every detail to your soil NPK, pH & weather</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-green-100 p-4 space-y-3">
        <div className="h-2.5 w-32 bg-gray-100 rounded-full" />
        <div className="flex rounded-xl overflow-hidden h-7 gap-0.5">
          {[...Array(4)].map((_, i) => <div key={i} className="flex-1 bg-gray-100" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-2.5 w-20 bg-gray-100 rounded-full" />
              <div className="h-2 w-14 bg-gray-100 rounded-full" />
              <div className="h-8 w-full bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NPK Input widget ─────────────────────────────────────────────────────────

function NpkInput({ label, value, onChange, min, max, unit, hint, color }: {
  label: string; value: number | ''; onChange: (v: number | '') => void;
  min: number; max: number; unit: string; hint: string; color: string;
}) {
  return (
    <div className={cn('rounded-xl border p-3', color)}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-bold">{label}</p>
        <span className="text-[10px] opacity-60">{unit}</span>
      </div>
      <input
        type="number" min={min} max={max} step={1} value={value}
        onChange={e => onChange(e.target.value === '' ? '' : Math.min(max, Math.max(min, Number(e.target.value))))}
        placeholder={`${Math.round((min + max) / 2)}`}
        className="w-full h-9 rounded-lg border border-current/20 bg-white/60 px-3 text-sm font-semibold focus:outline-none focus:bg-white transition"
      />
      <p className="text-[10px] opacity-50 mt-1.5 leading-tight">{hint}</p>
    </div>
  );
}

// ─── ResultCards ──────────────────────────────────────────────────────────────
// Guide is ALWAYS for the user-selected crop, not the ML top pick.

interface ResultCardsProps {
  selectedCropId: string;
  selectedCropName: string;
  selectedCropEmoji: string;
  topPreds: CropResult[];
  mlTopCrop: string;
  confidence: number;
  fieldSize: number;
  fieldUnit: FieldUnit;
  weather: any;
  cropDetails: CropDetails | null;
  isLoadingDetails: boolean;
}

function ResultCards({
  selectedCropId, selectedCropName, selectedCropEmoji,
  topPreds, mlTopCrop, confidence,
  fieldSize, fieldUnit, weather,
  cropDetails, isLoadingDetails,
}: ResultCardsProps) {

  const yieldRange = cropDetails
    ? cropDetails.yieldPerAcre.replace(/[^\d.–\-]/g, '').split(/[–\-]/).map(Number).filter(Boolean)
    : [];
  const mult = fieldUnit === 'hectare' ? 2.47 : fieldUnit === 'bigha' ? 0.4 : 1;
  const estMin = yieldRange[0] ? Math.round(yieldRange[0] * fieldSize * mult) : null;
  const estMax = yieldRange[1] ? Math.round(yieldRange[1] * fieldSize * mult) : null;
  const yieldDisplay = estMin && estMax ? `${estMin}–${estMax} qtl` : cropDetails?.yieldPerAcre ?? '—';

  const mlAgrees = mlTopCrop.toLowerCase() === selectedCropId.toLowerCase();

  return (
    <div className="space-y-5">

      {/* ── Hero — always shows selected crop ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900 via-green-700 to-emerald-500 p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 left-4 h-28 w-28 rounded-full bg-white/[0.04]" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-300 mb-2">📋 Cultivation Guide For</p>
          <div className="flex items-center gap-3 mb-3">
            <img src={getCropImage(selectedCropId)} alt={selectedCropName}
              className="h-16 w-16 rounded-xl object-cover border-2 border-white/20 flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = CROP_IMAGES.default; }} />
            <div>
              <h2 className="font-display text-3xl font-black leading-tight capitalize">{selectedCropName}</h2>
              <p className="text-sm text-green-200 mt-0.5">Your selected crop · AI-powered guide</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Soil-matched', 'NPK-calibrated', 'AI-verified'].map(t => (
              <span key={t} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">🌱 {t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── ML agree / disagree notice ── */}
      {mlAgrees ? (
        <div className="flex items-start gap-2.5 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-800">
            <span className="font-bold">Great match!</span> Our ML model also recommends <span className="font-semibold capitalize">{mlTopCrop}</span> as the #1 crop for your soil & weather — <span className="font-bold">{confidence.toFixed(1)}%</span> confidence.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <span className="font-bold">Heads up:</span> Our ML model's top pick is <span className="font-semibold capitalize">{mlTopCrop}</span> ({confidence.toFixed(1)}% confidence) for these conditions. The guide below is tailored to your selection — <span className="font-semibold capitalize">{selectedCropName}</span>.
          </p>
        </div>
      )}

      {/* ── ML top predictions bar ── */}
      {topPreds.length > 0 && (
        <div className="bg-white rounded-2xl border border-green-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">🏆 ML Model Predictions</p>
          <div className="space-y-2">
            {topPreds.map((p, i) => {
              const isSelected = p.crop.toLowerCase() === selectedCropId.toLowerCase();
              return (
                <div key={i} className={cn('flex items-center gap-3 rounded-xl px-2 py-1.5',
                  isSelected ? 'bg-green-50 border border-green-200' : '')}>
                  <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">#{p.rank}</span>
                  <span className={cn('text-xs font-semibold w-24 flex-shrink-0 capitalize', isSelected ? 'text-green-800' : 'text-gray-800')}>{p.crop}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', i === 0 ? 'bg-green-500' : 'bg-green-200')}
                      style={{ width: `${p.confidence}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 tabular-nums w-12 text-right">{p.confidence.toFixed(1)}%</span>
                  <span className={cn('text-[9px] font-bold rounded-md px-1.5 py-0.5',
                    p.suitability === 'Excellent' ? 'bg-green-100 text-green-700'
                      : p.suitability === 'Good' ? 'bg-sky-100 text-sky-700'
                        : 'bg-gray-100 text-gray-600')}>{p.suitability}</span>
                  {isSelected && <span className="text-[9px] font-bold text-green-600 bg-green-100 rounded-md px-1.5 py-0.5">Your pick</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Skeleton while Claude generates ── */}
      {isLoadingDetails && !cropDetails && <ResultSkeleton />}

      {/* ── Full AI-generated guide ── */}
      {cropDetails && (
        <>
          {/* AI badge */}
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
            <Cpu size={13} className="text-violet-500 flex-shrink-0" />
            <p className="text-[11px] text-violet-800">
              <span className="font-bold">AI-generated guide</span> — Personalised for <span className="font-semibold capitalize">{selectedCropName}</span> based on your exact soil type, NPK values, pH & weather.
            </p>
          </div>

          {/* ⚡ At a glance */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">⚡ At a Glance</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <StatCard icon="⏱️" label="Grow Duration" value={cropDetails.harvestDays} sub={`pH range: ${cropDetails.phRange}`} accentLeft="border-l-amber-400" />
              <StatCard icon="💧" label="Water / Week" value={cropDetails.waterPerWeek} sub={`Season total: ${cropDetails.totalWater}`} accentLeft="border-l-sky-400" />
              <StatCard icon="📦" label={`Yield (${fieldSize} ${fieldUnit})`} value={yieldDisplay} sub={`Market: ${cropDetails.marketPrice}`} accentLeft="border-l-emerald-400" />
              <StatCard icon="🏪" label="Storage Life" value={cropDetails.storageLife} sub={`NPK: ${cropDetails.npk}`} accentLeft="border-l-violet-400" />
            </div>
          </div>

          {/* 🌱 Planting specs */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">🌱 Planting Specs</p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: '↔️', label: 'Row Spacing', value: cropDetails.rowSpacing },
                { icon: '↕️', label: 'Plant Spacing', value: cropDetails.plantSpacing },
                { icon: '🌱', label: 'Seed Rate', value: cropDetails.seedRate },
              ].map(c => (
                <div key={c.label} className="rounded-xl border border-green-100 bg-white p-3">
                  <p className="text-lg mb-1">{c.icon}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{c.label}</p>
                  <p className="text-sm font-bold text-green-900 mt-0.5">{c.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 📈 Growth phases */}
          <div className="bg-white rounded-2xl border border-green-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">📈 Growth Phases</p>
            <div className="flex rounded-xl overflow-hidden mb-3 h-7">
              {cropDetails.growthPhases.map((p, i) => (
                <div key={i} className={cn('flex-1', p.color)} title={`${p.label}: Day ${p.days}`} />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cropDetails.growthPhases.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className={cn('mt-0.5 h-2.5 w-2.5 rounded-full flex-shrink-0', p.color)} />
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">{p.label}</p>
                    <p className="text-[10px] text-gray-400">Day {p.days}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5 leading-tight">{p.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🧪 Fertilizer schedule */}
          <div className="bg-white rounded-2xl border border-green-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">🧪 Fertilizer Schedule</p>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-px bg-green-100" />
              <div className="space-y-3">
                {cropDetails.fertSchedule.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 pl-1">
                    <div className="relative z-10 h-8 w-8 rounded-full bg-white border-2 border-green-200 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-green-700">{i + 1}</div>
                    <div className={cn('flex-1 rounded-xl border px-3 py-2.5', d.color)}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-bold">{d.product}</p>
                          <p className="text-[10px] mt-0.5 opacity-75">{d.dose}</p>
                        </div>
                        <span className="text-[10px] font-bold opacity-60 flex-shrink-0">{d.timing}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 💧 Critical stages + 🐛 Pest watch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-white rounded-2xl border border-sky-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500 mb-3">💧 Critical Water Stages</p>
              <div className="space-y-2">
                {cropDetails.criticalStages.map((st, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-sky-700">{i + 1}</div>
                    <p className="text-xs text-gray-700">{st}</p>
                  </div>
                ))}
              </div>
              {weather && (
                <div className="mt-3 rounded-xl bg-sky-50 border border-sky-100 px-3 py-2">
                  <p className="text-[10px] text-sky-700">
                    <span className="font-bold">Live weather:</span> {weather.humidity}% RH · {weather.temperature}°C
                    {weather.humidity > 70 ? ' — reduce irrigation by ~20%' : ' — follow standard schedule'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-red-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3">🐛 Pest & Disease Watch</p>
              <div className="space-y-2">
                {cropDetails.topPests.map((p, i) => (
                  <div key={i} className={cn('rounded-xl border px-3 py-2.5', severityBadge(p.severity))}>
                    <div className="flex items-start gap-2 mb-1">
                      <SeverityDot s={p.severity} />
                      <p className="text-[11px] font-bold">{p.name}</p>
                      <span className="ml-auto text-[9px] font-bold uppercase opacity-60">{p.severity}</span>
                    </div>
                    <p className="text-[10px] opacity-75 leading-tight">{p.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ⚡ Smart farming tips */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-3">⚡ Smart Farming Tips</p>
            <div className="space-y-2">
              {cropDetails.smartTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2.5 border border-emerald-100">
                  <Zap size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-emerald-900 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-1">
            <Cpu size={11} className="text-gray-300" />
            <p className="text-[10px] text-gray-300">Guide by Claude AI · Tailored to your soil NPK, pH & weather</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function CropRecommendationPage() {

  const [step, setStep] = useState(0);


  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<LocationPreset | null>(null);


  // Step 0
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');

  // Step 1 — field
  const [fieldSize, setFieldSize] = useState<number | ''>('');
  const [fieldUnit, setFieldUnit] = useState<FieldUnit>('acre');
  const [soilType, setSoilType] = useState('');
  const [moisture, setMoisture] = useState(50);
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'experienced'>('intermediate');

  // Step 1 — NPK & pH (user-entered from soil test)
  const [nitrogen, setNitrogen] = useState<number | ''>(40);
  const [phosphorus, setPhosphorus] = useState<number | ''>(40);
  const [potassium, setPotassium] = useState<number | ''>(40);
  const [soilPH, setSoilPH] = useState<number | ''>(6.5);

  // Step 2
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [manualCity, setManualCity] = useState('');
  const [manualRain, setManualRain] = useState<number | ''>('');

  // Step 3
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const { lat, lon, loading: geoLoading, error: geoError } = useGeolocation();
  const { data: weather, isLoading: weatherLoading } = useCurrentWeather(
    lat!, lon!, { enabled: !geoLoading && !!lat && !!lon && locationMode === 'auto' }
  );


  const { mutate: recommend, isPending, data: result, isSuccess, reset: resetMutation } = useRecommendCrop();
  const { mutate: fetchCropDetails, data: cropDetails, isPending: isLoadingDetails, reset: resetCropDetails } = useCropDetails();
  const selectedCat = CROP_CATEGORIES.find(c => c.id === selectedCatId);
  const selectedCrop = selectedCat?.crops.find(c => c.id === selectedCropId);
  console.log("crop details", { cropDetails, isLoadingDetails });


  const handlePresetSelect = (preset: LocationPreset) => {
    setSelectedPreset(preset);
    // Fill Step 1 soil + NPK
    setSoilType(preset.soilType);
    setNitrogen(preset.nitrogen);
    setPhosphorus(preset.phosphorus);
    setPotassium(preset.potassium);
    setSoilPH(preset.ph);
    // Fill Step 2 weather/location
    setManualCity(`${preset.name}, ${preset.state}`);
    setManualRain(preset.rainfall);
    setLocationMode('manual');
    setSidebarOpen(false);
  };

  const handlePresetClear = () => {
    setSelectedPreset(null);
  };


  // When ML result arrives → fetch Claude guide for USER-SELECTED crop
  useEffect(() => {
    if (isSuccess && result) {
      setApiDone(true);
      fetchCropDetails({
        // ⚠️ Use selectedCropId — NOT result.recommended_crop
        crop: selectedCropId,
        soilType,
        temperature: weather?.temperature ?? 25,
        humidity: weather?.humidity ?? 65,
        // In handleSubmit, replace the rainfall line:
        rainfall: typeof manualRain === 'number'
          ? Math.round(manualRain / 12)          // annual → monthly average
          : (weather ? 120 : 100),
        fieldSizeAcres: Number(fieldSize),
        fieldUnit,
        experience,
        city: locationMode === 'manual' ? manualCity : (weather?.location ?? ''),
        // Pass user's actual NPK & pH so Claude tailors the fertilizer advice
        nitrogen: typeof nitrogen === 'number' ? nitrogen : 40,
        phosphorus: typeof phosphorus === 'number' ? phosphorus : 40,
        potassium: typeof potassium === 'number' ? potassium : 40,
        soilPH: typeof soilPH === 'number' ? soilPH : 6.5,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, result]);

  const canProceed = useCallback((): boolean => {
    if (step === 0) return !!selectedCropId && !!selectedCatId;
    if (step === 1) return !!fieldSize && !!soilType;
    return true;
  }, [step, selectedCropId, selectedCatId, fieldSize, soilType]);

  const handleSubmit = () => {
    if (!selectedCropId || !selectedCatId || !fieldSize || !soilType) return;
    const payload: RecommendInput = {
      nitrogen: typeof nitrogen === 'number' ? nitrogen : 40,
      phosphorus: typeof phosphorus === 'number' ? phosphorus : 40,
      potassium: typeof potassium === 'number' ? potassium : 40,
      temperature: weather?.temperature ?? 25,
      humidity: weather?.humidity ?? 65,
      rainfall: typeof manualRain === 'number' ? manualRain : (weather ? 120 : 100),
      soil_pH: typeof soilPH === 'number' ? soilPH : 6.5,
      moisture,
      field_size_acres: Number(fieldSize),
      soil_type: soilType as any,
      crop_category: selectedCatId as any,
      city: locationMode === 'manual' ? manualCity : weather?.location,
      top_k: 3,
    };
    setShowResult(false); setApiDone(false);
    resetMutation(); resetCropDetails();
    setShowAnalysis(true);
    recommend(payload);
  };

  const handleAnalysisComplete = () => {
    setShowAnalysis(false); setShowResult(true); setStep(3);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleNext = () => { if (step === 2) { handleSubmit(); return; } setStep(s => s + 1); };
  const handleBack = () => setStep(s => Math.max(0, s - 1));
  const handleReset = () => {
    setStep(0); setSelectedCatId(''); setSelectedCropId('');
    setFieldSize(''); setSoilType(''); setShowResult(false);
    setApiDone(false); resetMutation(); resetCropDetails();
  };

  const isWeatherLoading = geoLoading || weatherLoading;
  const isWeatherReady = !!weather && !isWeatherLoading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeSlideUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .anim-up { animation: fadeSlideUp 0.38s cubic-bezier(.22,.68,0,1.2) both; }
        @keyframes staggerIn    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .stagger { animation: staggerIn 0.32s ease both; }
        @keyframes fadeIn       { from { opacity:0; } to { opacity:1; } }
        .animate-fadeIn { animation: fadeIn 0.25s ease both; }
        @keyframes resultReveal { from { opacity:0; transform:translateY(28px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .animate-resultReveal { animation: resultReveal 0.5s cubic-bezier(.22,.68,0,1.2) both; }
        .step-card { border:1.5px solid; transition:all 0.18s ease; cursor:pointer; }
        .step-card:hover  { transform:translateY(-2px); }
        .step-card.active { transform:translateY(-2px); }
        .progress-track { height:3px; background:#dcfce7; border-radius:99px; overflow:hidden; }
        .progress-fill  { height:100%; background:linear-gradient(90deg,#15803d,#4ade80); border-radius:99px; transition:width 0.5s cubic-bezier(.22,.68,0,1.2); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#bbf7d0; border-radius:4px; }
      `}</style>

      <AnalysisOverlay isVisible={showAnalysis} apiDone={apiDone} onComplete={handleAnalysisComplete} />

      <div className="font-body min-h-screen flex">

        <LocationSidebar
          onSelect={handlePresetSelect}
          selectedPresetId={selectedPreset?.id ?? null}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(v => !v)}
        />

        <div className="flex-1 min-w-0">


          {step > 0 && (
            <div className="sticky top-0 z-30 backdrop-blur-md border-b border-green-100">
              <div className="mx-auto max-w-3xl px-4 py-3">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-800 to-green-500 flex items-center justify-center shadow-md">
                      <Sprout size={15} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Smart Farming</p>
                      <h1 className="font-display text-sm font-bold text-green-950 leading-tight">Crop Recommendation</h1>
                    </div>
                  </div>
                  {step > 0 && step < 3 && (
                    <button onClick={handleBack} className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition">
                      <ChevronLeft size={13} /> Back
                    </button>
                  )}
                  {step === 3 && (
                    <button onClick={handleReset} className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition">
                      <RefreshCw size={12} /> New Assessment
                    </button>
                  )}
                </div>
                <div className="progress-track mb-2">
                  <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                  {STEPS.map((s, i) => (
                    <button key={i} onClick={() => i < step && setStep(i)}
                      className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap transition flex-shrink-0',
                        i === step ? 'bg-green-700 text-white' : i < step ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' : 'bg-gray-100 text-gray-400 cursor-default')}>
                      {i < step ? <CheckCircle2 size={9} /> : <span>{s.icon}</span>}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mx-auto max-w-3xl px-4 py-6 pb-28">

            {/* ══ STEP 0 ══ */}
            {step === 0 && (
              <div className="anim-up">
                <div className="text-center mb-6">
                  <p className="text-3xl mb-2">🌾</p>
                  <h2 className="font-display text-4xl font-bold text-green-950 mb-1">What are you growing?</h2>
                  <p className="text-sm text-gray-500">Select a category, then pick your specific crop</p>
                </div>

                <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {CROP_CATEGORIES.map(cat => (
                    <button key={cat.id}
                      onClick={() => { setSelectedCatId(cat.id); setSelectedCropId(''); }}
                      className={cn('flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap border-[1.5px] transition flex-shrink-0',
                        selectedCatId === cat.id ? 'bg-green-700 border-green-700 text-white' : `${cat.bg} ${cat.border} ${cat.accent} hover:border-current`)}>
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>

                {selectedCat ? (
                  <div className="anim-up grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {selectedCat.crops.map((crop, i) => (
                      <button key={crop.id} onClick={() => setSelectedCropId(crop.id)}
                        className={cn('step-card rounded-2xl p-4 text-left', selectedCat.border,
                          selectedCropId === crop.id ? `${selectedCat.bg} active shadow-lg` : 'bg-white', 'stagger')}
                        style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="flex items-start justify-between mb-2">
                          {<span className="text-5xl">{crop.emoji}</span>}
                          {selectedCropId === crop.id && <CheckCircle2 size={15} className="text-green-600" />}
                        </div>
                        <p className="font-bold text-sm text-green-950">{crop.name}</p>
                        <p className="text-[10px] text-amber-700 font-semibold mt-0.5">{crop.season}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">⏱ {crop.duration}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-2">👆</p>
                    <p className="text-sm">Select a category above to see available crops</p>
                  </div>
                )}
              </div>
            )}

            {/* ══ STEP 1 ══ */}
            {step === 1 && (
              <div className="anim-up space-y-5">
                <div className="text-center mb-2">
                  <p className="text-3xl mb-2">📐</p>
                  <h2 className="font-display text-2xl font-bold text-green-950 mb-1">Your Field Details</h2>
                  <p className="text-sm text-gray-500">Enter your soil test values for precise AI recommendations</p>
                </div>

                {/* Field size */}
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={15} className="text-green-600" />
                    <h3 className="font-bold text-sm text-green-900">Field / Land Size</h3>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" min={0.1} step={0.1} value={fieldSize}
                      onChange={e => setFieldSize(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="e.g. 2.5"
                      className="flex-1 h-12 rounded-xl border-[1.5px] border-green-200 bg-green-50/50 px-4 text-sm font-semibold text-green-950 placeholder:text-gray-300 focus:outline-none focus:border-green-500 transition" />
                    <div className="flex gap-1">
                      {FIELD_UNITS.map(u => (
                        <button key={u} onClick={() => setFieldUnit(u)}
                          className={cn('h-12 px-3 rounded-xl border-[1.5px] text-xs font-bold transition capitalize',
                            fieldUnit === u ? 'bg-green-700 border-green-700 text-white' : 'bg-white border-green-200 text-green-700 hover:bg-green-50')}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Soil type */}
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical size={15} className="text-amber-600" />
                    <h3 className="font-bold text-sm text-green-900">Soil Type</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SOIL_TYPES.map((soil, i) => (
                      <button key={soil.id} onClick={() => setSoilType(soil.id)}
                        className={cn('step-card rounded-xl p-3 text-left border-amber-100',
                          soilType === soil.id ? 'bg-amber-50 border-amber-300 active' : 'bg-stone-50 hover:bg-amber-50/50', 'stagger')}
                        style={{ animationDelay: `${i * 0.04}s` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{soil.emoji}</span>
                          {soilType === soil.id && <CheckCircle2 size={12} className="text-amber-600 ml-auto" />}
                        </div>
                        <p className="text-xs font-bold text-gray-800">{soil.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{soil.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── NPK & pH ── */}
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <FlaskConical size={15} className="text-green-600" />
                    <h3 className="font-bold text-sm text-green-900">Soil NPK & pH Values</h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-4">From your Soil Health Card or lab report. These directly feed the ML model and personalise the AI cultivation guide.</p>
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <NpkInput
                      label="Nitrogen (N)" value={nitrogen} onChange={setNitrogen}
                      min={0} max={200} unit="kg/ha"
                      hint="Low <40 · Medium 40–80 · High >80"
                      color="bg-lime-50 border border-lime-200 text-lime-900"
                    />
                    <NpkInput
                      label="Phosphorus (P)" value={phosphorus} onChange={setPhosphorus}
                      min={0} max={150} unit="kg/ha"
                      hint="Low <20 · Medium 20–50 · High >50"
                      color="bg-orange-50 border border-orange-200 text-orange-900"
                    />
                    <NpkInput
                      label="Potassium (K)" value={potassium} onChange={setPotassium}
                      min={0} max={210} unit="kg/ha"
                      hint="Low <40 · Medium 40–80 · High >80"
                      color="bg-sky-50 border border-sky-200 text-sky-900"
                    />
                    <NpkInput
                      label="Soil pH" value={soilPH} onChange={setSoilPH}
                      min={3} max={10} unit="pH"
                      hint="Acidic <6.5 · Neutral 6.5–7.5 · Alkaline >7.5"
                      color="bg-violet-50 border border-violet-200 text-violet-900"
                    />
                  </div>
                  <div className="flex items-start gap-2 bg-amber-50 rounded-xl border border-amber-100 px-3 py-2">
                    <Info size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700">No soil test report? Use values from your state's <span className="font-bold">Soil Health Card</span>. Defaults shown are typical Indian averages.</p>
                  </div>
                </div>

                {/* Moisture */}
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Droplets size={15} className="text-sky-600" />
                      <h3 className="font-bold text-sm text-green-900">Soil Moisture</h3>
                    </div>
                    <span className="text-sm font-bold text-sky-700">{moisture}%</span>
                  </div>
                  <input type="range" min={15} max={85} step={1} value={moisture}
                    onChange={e => setMoisture(Number(e.target.value))} className="w-full accent-sky-500" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Dry (15%)</span><span>Optimal (50%)</span><span>Wet (85%)</span>
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={15} className="text-violet-600" />
                    <h3 className="font-bold text-sm text-green-900">Farming Experience</h3>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { id: 'beginner', label: 'Beginner', emoji: '🌱', sub: '0–2 yrs' },
                      { id: 'intermediate', label: 'Intermediate', emoji: '🌿', sub: '3–7 yrs' },
                      { id: 'experienced', label: 'Experienced', emoji: '🌳', sub: '8+ yrs' },
                    ].map(exp => (
                      <button key={exp.id} onClick={() => setExperience(exp.id as any)}
                        className={cn('flex-1 rounded-xl p-3 text-center border-[1.5px] transition',
                          experience === exp.id ? 'bg-violet-50 border-violet-300' : 'bg-stone-50 border-stone-200 hover:bg-violet-50/50')}>
                        <div className="text-2xl mb-1">{exp.emoji}</div>
                        <p className="text-xs font-bold text-gray-800">{exp.label}</p>
                        <p className="text-[10px] text-gray-400">{exp.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 2 ══ */}
            {step === 2 && (
              <div className="anim-up space-y-5">
                <div className="text-center mb-2">
                  <p className="text-3xl mb-2">🌤️</p>
                  <h2 className="font-display text-2xl font-bold text-green-950 mb-1">Weather & Location</h2>
                  <p className="text-sm text-gray-500">Live weather fine-tunes your irrigation & sowing advice</p>
                </div>

                <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation size={15} className="text-green-600" />
                    <h3 className="font-bold text-sm text-green-900">Location Source</h3>
                  </div>
                  <div className="flex gap-2">
                    {[{ id: 'auto', label: 'Auto GPS', emoji: '📍' }, { id: 'manual', label: 'Enter manually', emoji: '✍️' }].map(m => (
                      <button key={m.id} onClick={() => setLocationMode(m.id as any)}
                        className={cn('flex-1 rounded-xl p-3 border-[1.5px] text-sm font-semibold transition flex items-center justify-center gap-2',
                          locationMode === m.id ? 'bg-green-700 border-green-700 text-white' : 'bg-white border-green-200 text-green-700 hover:bg-green-50')}>
                        <span>{m.emoji}</span> {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {locationMode === 'auto' && (
                  <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm anim-up">
                    {isWeatherLoading && (
                      <div className="flex items-center gap-3">
                        <Loader2 size={18} className="animate-spin text-sky-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-sky-800">Detecting your location…</p>
                          <p className="text-xs text-sky-500 mt-0.5">Fetching live weather data</p>
                        </div>
                      </div>
                    )}
                    {geoError && !geoLoading && (
                      <div className="flex items-center gap-3 bg-amber-50 rounded-xl border border-amber-200 p-3">
                        <CloudOff size={15} className="text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-800">Location access denied — switch to manual entry</p>
                      </div>
                    )}
                    {isWeatherReady && weather && (
                      <div className="anim-up">
                        <div className="flex items-center gap-3 mb-4">
                          <img src={`https:${weather.icon}`} alt={weather.condition} className="h-10 w-10 flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-green-600" />
                              <p className="text-sm font-bold text-green-900">{weather.location}</p>
                              <span className="text-[9px] font-bold bg-green-200 text-green-800 rounded-full px-1.5 py-0.5">LIVE</span>
                            </div>
                            <p className="text-xs text-gray-500">{weather.condition}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                          {[
                            { icon: '🌡️', label: 'Temperature', value: `${weather.temperature}°C` },
                            { icon: '💧', label: 'Humidity', value: `${weather.humidity}%` },
                            { icon: '💨', label: 'Wind', value: `${weather.wind_speed} km/h` },
                            { icon: '☁️', label: 'Cloud Cover', value: `${weather.clouds}%` },
                            { icon: '👁️', label: 'Visibility', value: `${weather.visibility} km` },
                            { icon: '🌡️', label: 'Feels Like', value: `${weather.feels_like}°C` },
                          ].map(stat => (
                            <div key={stat.label} className="bg-green-50 rounded-xl border border-green-100 p-3">
                              <p className="text-base mb-1">{stat.icon}</p>
                              <p className="text-[10px] text-gray-500">{stat.label}</p>
                              <p className="text-sm font-bold text-green-900">{stat.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-start gap-2 bg-emerald-50 rounded-xl border border-emerald-200 p-3">
                          <Zap size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-emerald-800">
                            <span className="font-bold">Smart Insight:</span>{' '}
                            {weather.temperature > 35 ? 'High heat — guide will prioritize drought-tolerant strategies & early-morning irrigation.'
                              : weather.humidity > 75 ? 'High humidity — fungal risk elevated; guide will include preventive spray schedule.'
                                : weather.temperature < 15 ? 'Cool conditions — ideal for rabi crops; sowing window adjusted accordingly.'
                                  : 'Conditions look favorable. Ready to generate your personalised guide.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {locationMode === 'manual' && (
                  <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm anim-up space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-green-800 mb-2">Village / City / District</label>
                      <input type="text" value={manualCity} onChange={e => setManualCity(e.target.value)}
                        placeholder="e.g. Nashik, Maharashtra"
                        className="w-full h-12 rounded-xl border-[1.5px] border-green-200 bg-green-50/50 px-4 text-sm text-green-950 placeholder:text-gray-300 focus:outline-none focus:border-green-500 transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-green-800 mb-2">Expected Annual Rainfall (mm)</label>
                      <input type="number" min={15} max={3000} value={manualRain}
                        onChange={e => setManualRain(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 850"
                        className="w-full h-12 rounded-xl border-[1.5px] border-green-200 bg-green-50/50 px-4 text-sm text-green-950 placeholder:text-gray-300 focus:outline-none focus:border-green-500 transition" />
                    </div>
                  </div>
                )}

                {/* Farm summary */}
                <div className="rounded-2xl bg-gradient-to-br from-green-800 to-green-600 p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf size={14} className="text-green-300" />
                    <h3 className="font-bold text-sm">Your Farm Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { label: 'Crop', value: `${selectedCrop?.emoji ?? ''} ${selectedCrop?.name ?? '—'}` },
                      { label: 'Field', value: `${fieldSize || '—'} ${fieldUnit}` },
                      { label: 'Soil', value: SOIL_TYPES.find(s => s.id === soilType)?.label ?? '—' },
                      { label: 'N·P·K', value: `${nitrogen || '—'}·${phosphorus || '—'}·${potassium || '—'} kg/ha` },
                      { label: 'pH', value: soilPH ? `${soilPH}` : '—' },
                      { label: 'Moisture', value: `${moisture}%` },
                    ].map(item => (
                      <div key={item.label} className="bg-white/10 rounded-xl p-2.5">
                        <p className="text-green-300 text-[10px]">{item.label}</p>
                        <p className="font-bold mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 3 ══ */}
            {step === 3 && showResult && result && (
              <div ref={resultRef} className="animate-resultReveal">
                <ResultCards
                  selectedCropId={selectedCropId}
                  selectedCropName={selectedCrop?.name ?? selectedCropId}
                  selectedCropEmoji={selectedCrop?.emoji ?? '🌱'}
                  topPreds={result.top_predictions}
                  mlTopCrop={result.recommended_crop}
                  confidence={result.confidence}
                  fieldSize={Number(fieldSize)}
                  fieldUnit={fieldUnit}
                  weather={weather}
                  cropDetails={cropDetails ?? null}
                  isLoadingDetails={isLoadingDetails}
                />
              </div>
            )}

            {step === 3 && !showResult && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 size={28} className="animate-spin mb-3 text-green-500" />
                <p className="text-sm">Preparing your recommendation…</p>
              </div>
            )}

          </div>

          {/* ── Fixed bottom CTA ── */}
          {step < 3 && (
            <div className="relative w-[30px]">
              <div className="mx-auto max-w-3xl fixed bottom-4 right-4 z-30 flex items-center gap-3">
                <button onClick={handleNext} 
                  className={cn(
                    'flex items-center gap-2 rounded-xl h-11 px-6 text-sm font-bold transition-all',
                    'bg-gradient-to-r from-green-900 to-green-600 text-white shadow-lg shadow-green-800/25',
                    'hover:brightness-110 hover:-translate-y-0.5',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none',
                  )}>
                  {step === 2
                    ? (isPending ? <><Loader2 size={14} className="animate-spin" /> Analysing…</> : <><Sprout size={14} /> Get Recommendation</>)
                    : <>Next <ChevronRight size={14} /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}