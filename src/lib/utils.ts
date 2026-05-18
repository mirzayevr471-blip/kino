import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TIER_LEVELS: Record<string, number> = {
  'free': 0,
  'basic': 1,
  'premium': 2
};

export function canAccess(movieTier: string | undefined, userSubscription: string | undefined): boolean {
  const movieLevel = TIER_LEVELS[movieTier || 'free'] ?? 0;
  const userLevel = TIER_LEVELS[userSubscription || 'free'] ?? 0;
  return userLevel >= movieLevel;
}
