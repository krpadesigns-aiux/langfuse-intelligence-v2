export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Confidence = 'high' | 'medium' | 'low';

export interface RiskTokens {
  border: string;
  bg: string;
  text: string;
  label: string;
}

// Severity tokens — CRITICAL (#e2483d) / HIGH / MEDIUM from the Figma design system
export const riskTokens: Record<Severity, RiskTokens> = {
  critical: {
    border: 'border-red-300',
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'Critical',
  },
  high: {
    border: 'border-orange-300',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    label: 'High',
  },
  medium: {
    border: 'border-amber-300',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'Medium',
  },
  low: {
    border: 'border-gray-300',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: 'Low',
  },
};

export interface ConfidenceTokens {
  text: string;
  bg: string;
  label: string;
}

// Confidence badge tokens — green/amber/gray per design spec
export const confidenceTokens: Record<Confidence, ConfidenceTokens> = {
  high: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    label: 'High Confidence',
  },
  medium: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Medium Confidence',
  },
  low: {
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    label: 'Low Confidence',
  },
};

// Raw hex values for non-Tailwind contexts (canvas, charts, inline styles)
export const riskHex: Record<Severity, { border: string; bg: string; text: string }> = {
  critical: { border: '#e2483d', bg: '#fef2f2', text: '#dc2626' },
  high:     { border: '#f97316', bg: '#fff7ed', text: '#ea580c' },
  medium:   { border: '#f59e0b', bg: '#fffbeb', text: '#d97706' },
  low:      { border: '#d1d5db', bg: '#f9fafb', text: '#6b7280' },
};
