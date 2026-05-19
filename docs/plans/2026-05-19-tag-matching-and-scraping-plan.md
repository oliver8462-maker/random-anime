# Implementation Plan: Advanced Filtering & Category Scraping

## 1. Goal Description

This plan addresses two new requirements for the Anime Tag Filter:
1. **Fallback Matching (最大限度滿足標籤):** When no anime perfectly matches all the selected "Attribute" tags, the system should return the animations that match the highest number of selected tags instead of returning zero results.
2. **Category & Audience Scraping (類型與對象抓取):** Since "Type" and "Audience" are not listed as standard tags on the anime detail pages, we will directly scrape the filtered list pages on Bahamut (e.g., `?category=電影`, `?target=年齡限制`) to identify which animations belong to which type and audience.

## 2. User Review Required

> [!IMPORTANT]
> **Clarification on Frontend vs Scraping:**
> My understanding of "直接抓取頁面中滿足條件的動畫即可" is that you want me to write a **Node.js scraping script** that visits `https://ani.gamer.com.tw/animeList.php?category=電影` etc., grabs all the anime URLs from those filtered pages, and then updates our local `data.json` so the frontend can filter them instantly without CORS issues.
> 
> Is this approach correct? Or do you want the frontend web application itself to fetch from Bahamut live when the user clicks "Randomize"? (Live fetching in the browser usually fails due to CORS, so a Node.js scraper updating `data.json` is the standard approach).

## 3. Proposed Changes

### Scraping Scripts

#### [NEW] `scripts/fetch-categories.js`
- Create a new script that iterates through the predefined Type and Audience parameters:
  - `category`: `電影`, `OVA`, `雙語`, `泡麵番`, `真人演出`
  - `target`: `闔家觀賞`, `付費會員`, `年齡限制`
- For each parameter, it will paginate through `https://ani.gamer.com.tw/animeList.php` and collect the anime URLs.
- It will then update `public/data.json` by appending these as pseudo-tags into the `anime.tags` array (so the frontend logic doesn't need to change!), or add them as explicit fields. 
- *Design Choice:* Appending them to `anime.tags` is the easiest since `filterLogic.js` already checks `anime.tags.includes(state.type)`.

### Frontend Logic

#### [MODIFY] `src/filterLogic.js`
- Update `filterAnimes(animes, state)` to implement the fallback logic.
- **New Logic:**
  1. Filter out all animes that don't match the selected `type` and `audience` (these are strict requirements).
  2. For the remaining animes, count how many of the selected `attributes` they possess (Score).
  3. Find the maximum score among all animes.
  4. If the max score > 0, return all animes that have this maximum score.
  5. If max score === 0 and the user selected attributes, return all remaining animes (or none, depending on preference).
  
#### [MODIFY] `src/filterLogic.test.js`
- Add unit tests for the fallback logic to ensure that if an anime matches 2/3 tags, and another matches 1/3, the 2/3 one is returned.

## 4. Verification Plan

### Automated Tests
- Run `npm run test` to verify the fallback logic in `filterLogic.js`.

### Manual Verification
- Run `node scripts/fetch-categories.js` to populate `data.json` with the new categories.
- Run the dev server and test filtering by "電影" to see if it correctly returns movies.
- Test selecting conflicting attributes to see if it gracefully falls back to the maximum matched tags.
