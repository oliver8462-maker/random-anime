# Anime Tag Filter Design

## Overview
Replaces the flat, single-tag filter system in the Random Anime Picker with an advanced, multi-category filter system mirroring the official Bahamut Anime Crazy layout.

## Data Structure
- **Source of Truth**: `FILTER_CONFIG` object defining categories, rules, and options.
- **Categories**:
  - `attributes` (屬性): multi-select, max 5, tags: 全部, 動作, 冒險, 奇幻...
  - `type` (類型): single-select, tags: 全部, 電影, OVA, 雙語, 泡麵番, 真人演出
  - `audience` (對象): single-select, tags: 全部, 闔家觀賞, 付費會員, 年齡限制

## State Management
- Unified `filterState` object tracks selections across categories.
- `attributes` uses a `Set` to easily handle multi-select logic.
- `type` and `audience` use strings.
- Selecting "全部" in any category clears other selections in that category. Selecting any specific tag clears "全部".

## DOM & UI
- Data-driven rendering: JavaScript iterates over `FILTER_CONFIG` to generate HTML components for each category.
- UI features a clean row-based layout matching the existing glassmorphism aesthetic.
- Category headers include dynamic counters (e.g., "(1/5)") for multi-select categories.

## Filtering Logic
- "AND" logic across boundaries: an anime must match the selected Attributes AND the Type AND the Audience to be included in the randomized pool.
- Within Attributes: if multiple are selected, the anime must contain ALL selected attributes (strict AND logic).
