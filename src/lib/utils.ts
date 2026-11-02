import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const ROLE_COLORS: Record<string, string> = {
  Frontend: '#38bdf8', // Sky
  Backend: '#3ECF8E',  // Supabase Emerald
  Fullstack: '#818cf8',// Indigo
  'AI/ML': '#c084fc',  // Purple
  Mobile: '#fb923c',   // Orange
  'UI/UX': '#f472b6',  // Pink
  Product: '#facc15',  // Amber
  Founder: '#f87171',  // Rose
  Other: '#94a3b8',    // Slate
};

export function getRoleColor(role: string): string {
  return ROLE_COLORS[role] || ROLE_COLORS.Other;
}

export function isPresenceActive(
  isAvailable: boolean,
  availableUntil?: string | null,
  nowMs: number = Date.now()
): boolean {
  if (!isAvailable) return false;
  if (availableUntil) {
    return new Date(availableUntil).getTime() > nowMs;
  }
  return true;
}

export function formatZoneString(zone: string | null | undefined): string {
  if (!zone || !zone.trim()) return '';
  return `📍 ${zone.trim()}`;
}

