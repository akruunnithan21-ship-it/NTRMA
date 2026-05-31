/**
 * WealthMaster Color System
 * ---------------------------------------------------------------------------
 * The actual color values now live in `palettes.ts` (two variants: `neon` and
 * `refined`). This file just selects the ACTIVE one and re-exports it as
 * `colors`, so every existing `import { colors } from '@/theme'` keeps working.
 *
 *  >>> To switch the whole app to the refined backup theme, change ONE line: <<<
 *      const ACTIVE_PALETTE: PaletteName = 'refined';
 * ---------------------------------------------------------------------------
 */

import { palettes, type PaletteName, type Palette } from './palettes';

// 👇 The single switch. Keep 'neon' for now; 'refined' is the redundant backup.
export const ACTIVE_PALETTE: PaletteName = 'neon';

export const colors: Palette = palettes[ACTIVE_PALETTE];

export type ColorKey = keyof Palette;
