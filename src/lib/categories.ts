/**
 * Shared constants that are safe to import in both Server and Client Components.
 * Do NOT import mongoose/db here.
 */
export type LayoutCategory =
  | 'MAKEUP CÔ DÂU'
  | 'MAKEUP TIỆC'
  | 'MAKEUP KỶ YẾU'
  | 'MAKEUP SỰ KIỆN'
  | 'MAKEUP CONCEPT';

export const LAYOUT_CATEGORIES: LayoutCategory[] = [
  'MAKEUP CÔ DÂU',
  'MAKEUP TIỆC',
  'MAKEUP KỶ YẾU',
  'MAKEUP SỰ KIỆN',
  'MAKEUP CONCEPT',
];
