/**
 * categories.ts — Shared type helpers.
 * Category data is now stored in MongoDB (collection: categories).
 * Use /api/categories to fetch the dynamic list.
 */

/** Generic string alias for a category name coming from the DB */
export type LayoutCategory = string;
