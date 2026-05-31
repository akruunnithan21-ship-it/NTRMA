/**
 * WealthMaster Motion System
 * Centralized animation timings, easings and spring configs so every screen
 * feels consistent. Used by Reanimated entering animations and shared values.
 */

import { Easing } from 'react-native-reanimated';

export const duration = {
  instant: 120,
  fast: 220,
  base: 360,
  slow: 600,
  number: 900, // count-up animations
} as const;

export const easing = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  bounce: Easing.elastic(1.1),
  linear: Easing.linear,
} as const;

export const spring = {
  // Snappy press feedback (buttons, cards)
  press: { damping: 15, stiffness: 400, mass: 0.6 },
  // Gentle settle (tab indicator, sheets)
  gentle: { damping: 18, stiffness: 180, mass: 0.9 },
  // Wobble (success / emphasis)
  wobble: { damping: 8, stiffness: 220, mass: 0.8 },
} as const;

/** Stagger helper: returns a delay (ms) for the Nth item in a list. */
export const stagger = (index: number, step = 60, base = 0) => base + index * step;
