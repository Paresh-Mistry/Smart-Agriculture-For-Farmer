import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatPercentage(num: number): string {
  return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
}

export const SEVERITY_META = {
  critical: { label: 'Critical',  bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-800',    dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700'    },
  high:     { label: 'High',      bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  moderate: { label: 'Moderate',  bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-800',  dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700'  },
  low:      { label: 'Low',       bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-800',  dot: 'bg-green-400',  badge: 'bg-green-100 text-green-700'  },
  none:     { label: 'No Weeds',  bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
};

export const TREATMENT_META = {
  chemical:   { icon: '⚗️', bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    badge: 'bg-red-100 text-red-700'    },
  organic:    { icon: '🌿', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  badge: 'bg-green-100 text-green-700'  },
  mechanical: { icon: '⚙️', bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-800',   badge: 'bg-gray-100 text-gray-700'    },
};

export function confidenceBadge(c: string) {
  return c === 'high'   ? 'bg-green-100 text-green-700'
    : c === 'medium'    ? 'bg-amber-100 text-amber-700'
    : 'bg-gray-100 text-gray-600';
}