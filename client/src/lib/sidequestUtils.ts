import type { HauntConfig } from "@shared/schema";

// Tier-based sidequest pools
export const SIDEQUEST_TIERS = {
  basic: [
    'glory-grab',
    'wack-a-chupacabra', 
    'cryptic-compliments'
  ],
  pro: [
    'glory-grab',
    'wack-a-chupacabra',
    'wretched-wiring',
    'lab-escape',
    'curse-crafting'
  ],
  premium: [
    'chupacabra-challenge',
    'crime',
    'cryptic-compliments',
    'curse-crafting',
    'face-the-chupacabra',
    'glory-grab',
    'lab-escape',
    'monster-name-generator',
    'wack-a-chupacabra',
    'wretched-wiring'
  ]
} as const;

/**
 * Select a random sidequest based on haunt tier
 */
export function selectRandomSidequest(hauntConfig: HauntConfig | null): string {
  const tier = hauntConfig?.tier || 'basic';
  const availableSidequests = SIDEQUEST_TIERS[tier];
  const randomIndex = Math.floor(Math.random() * availableSidequests.length);
  return availableSidequests[randomIndex];
}

/**
 * Check if sidequest should trigger randomly (20% chance after leaderboard view)
 */
export function shouldTriggerRandomSidequest(): boolean {
  return Math.random() < 0.2; // 20% chance
}

/**
 * Get available sidequests for a tier
 */
export function getAvailableSidequests(tier: 'basic' | 'pro' | 'premium'): string[] {
  return [...SIDEQUEST_TIERS[tier]];
}