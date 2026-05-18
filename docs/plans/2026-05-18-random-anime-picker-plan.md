# Random Anime Picker Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a sleek, mobile-friendly Random Anime Picker with filtering options (genre/mood) utilizing scraped data from Bahamut Anime Crazy.

**Architecture:** Vite + Vanilla JavaScript, static generation of anime JSON via Node.js scraper.

**Tech Stack:** Vite, HTML/JS/CSS, Node.js, Axios, Cheerio.

## User Review Required
> [!IMPORTANT]
> The scraper relies on scraping `https://ani.gamer.com.tw/`. If the DOM structure changes or bot protection kicks in, the scraper might fail. We will use `axios` and `cheerio` with a standard User-Agent. 

## Open Questions
> [!NOTE]
> 請問您希望「現在心情」的標籤有哪些？（例如：想放鬆、想痛哭、需要刺激）我會先預設幾個，稍後實作時您可以再增刪。

---

### Task 1: Scaffold Project Structure & Dependencies

**Files:**
- Create: `package.json`, `index.html`, etc.

**Step 1: Scrape out existing files if needed & Scaffold**
Run: `npx -y create-vite@latest . --template vanilla`

**Step 2: Install scraping dependencies**
Run: `npm install axios cheerio`

**Step 3: Commit**
```bash
git add .
git commit -m "chore: scaffold vite vanilla project and add scraper dependencies"
```

### Task 2: Write Scraper Script

**Files:**
- Create: `scripts/scraper.js`

**Step 1: Write scraper implementation**
```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

async function scrapeBahamut() {
  console.log('Scraping Bahamut Anime...');
  try {
    const { data } = await axios.get('https://ani.gamer.com.tw/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    const animes = [];
    
    // Select the new anime block or popular anime block
    $('.newanime-wrap .newanime-block').each((i, el) => {
      const title = $(el).find('.anime-name_info').text().trim();
      const href = $(el).attr('href');
      const img = $(el).find('.lazyload').attr('data-src');
      const info = $(el).find('.anime-watch-number').text().trim();
      
      if (title && href) {
        animes.push({
          id: i,
          title,
          url: `https://ani.gamer.com.tw/${href}`,
          cover: img,
          views: info,
          tags: ['熱血', '搞笑', '奇幻'][Math.floor(Math.random() * 3)] // Placeholder tags since homepage doesn't have full tags
        });
      }
    });

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    fs.writeFileSync(path.join(publicDir, 'data.json'), JSON.stringify(animes, null, 2));
    console.log(`Scraped ${animes.length} animes to public/data.json`);
  } catch (err) {
    console.error('Error scraping:', err.message);
  }
}

scrapeBahamut();
```

**Step 2: Run test to verify scraper works**
Run: `node scripts/scraper.js`
Expected: `public/data.json` is generated with valid JSON array.

**Step 3: Commit**
```bash
git add scripts/scraper.js public/data.json
git commit -m "feat: add bahamut scraper script"
```

### Task 3: Build Base UI (HTML/CSS)

**Files:**
- Modify: `index.html`
- Modify: `style.css`

**Step 1: Write HTML Structure**
Create the glassmorphism container, filter tags, main button, and result card placeholder in `index.html`.

**Step 2: Write CSS Variables and Styling**
Setup dark mode theme, glassmorphism (`backdrop-filter: blur`), hover animations in `style.css`.

**Step 3: Commit**
```bash
git add index.html style.css
git commit -m "feat: setup base ui layout and glassmorphism styling"
```

### Task 4: Implement Main Randomizer Logic

**Files:**
- Modify: `main.js`

**Step 1: Write Data Fetching & Random Logic**
Fetch `/data.json`, handle tag selection clicks, and write the logic for picking a random anime when the main button is clicked.

**Step 2: Write UI Update Logic**
Populate the Result Card DOM with the selected anime's cover, title, and link.

**Step 3: Commit**
```bash
git add main.js
git commit -m "feat: implement randomizer logic and result display"
```

### Task 5: Refine Animations & User Experience

**Files:**
- Modify: `style.css`
- Modify: `main.js`

**Step 1: Add Loading Animations**
Add a CSS spinner or pulse effect when the button is clicked, and a flip-in animation for the result card.

**Step 2: Simulate Delay**
Update `main.js` to add a `setTimeout` (e.g., 1-1.5s) before showing the result to build anticipation.

**Step 3: Commit**
```bash
git add style.css main.js
git commit -m "feat: add result card animations and delay"
```

## Verification Plan
### Manual Verification
1. Run `node scripts/scraper.js` to ensure the scrape is successful.
2. Run `npm run dev` and open the browser.
3. Verify that the UI looks sleek and dark mode is properly applied.
4. Click filter tags and ensure they toggle visually.
5. Click the randomize button, wait for the animation, and verify the result card displays correct data and links.
