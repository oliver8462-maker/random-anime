# Anime Tag Filter Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement a multi-category anime tag filter system using a data-driven UI and strict AND-logic matching.

**Architecture:** Replace the static HTML tags with a dynamic renderer driven by a `FILTER_CONFIG` object and a unified `filterState`. Extract logic out of UI functions so it can be tested.

**Tech Stack:** Vanilla JS, Vite, Vitest (to be added for TDD)

---

### Task 1: Setup Testing Environment

**Files:**
- Create: `vitest.config.js`
- Modify: `package.json`

**Step 1: Install Vitest**
Run: `npm install -D vitest jsdom`
Expected: PASS

**Step 2: Create config & add test script**
Modify `package.json`:
```json
"scripts": {
  "test": "vitest run"
}
```
Create `vitest.config.js`:
```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { environment: 'jsdom' }
})
```

**Step 3: Commit**
```bash
git add package.json package-lock.json vitest.config.js
git commit -m "chore: setup vitest for TDD"
```

---

### Task 2: Implement Core Filtering Logic and State Config

**Files:**
- Create: `src/filterLogic.js`
- Create: `src/filterLogic.test.js`

**Step 1: Write the failing test**
Create `src/filterLogic.test.js`:
```javascript
import { expect, test } from 'vitest';
import { FILTER_CONFIG, filterAnimes, createInitialState } from './filterLogic.js';

test('Initial state is correct', () => {
  const state = createInitialState();
  expect(state.attributes.has('全部')).toBe(true);
  expect(state.type).toBe('全部');
  expect(state.audience).toBe('全部');
});

test('Filters animes correctly with AND logic', () => {
  const animes = [
    { title: 'A', tags: ['動作', '奇幻', 'OVA', '闔家觀賞'] },
    { title: 'B', tags: ['動作', '電影', '年齡限制'] }
  ];
  
  const state = {
    attributes: new Set(['動作']),
    type: 'OVA',
    audience: '闔家觀賞'
  };
  
  const result = filterAnimes(animes, state);
  expect(result.length).toBe(1);
  expect(result[0].title).toBe('A');
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test`
Expected: FAIL with missing module error.

**Step 3: Write minimal implementation**
Create `src/filterLogic.js`:
```javascript
export const FILTER_CONFIG = [
  { id: 'attributes', label: '屬性', type: 'multi', limit: 5, options: ["全部", "動作", "冒險", "奇幻", "異世界", "魔法", "超能力", "科幻", "機甲", "校園", "喜劇", "戀愛", "青春", "勵志", "溫馨", "悠閒", "料理", "親情", "感人", "運動", "競技", "偶像", "音樂", "職場", "推理", "懸疑", "時間穿越", "歷史", "戰爭", "血腥暴力", "靈異神怪", "黑暗", "特攝", "BL", "GL"] },
  { id: 'type', label: '類型', type: 'single', options: ["全部", "電影", "OVA", "雙語", "泡麵番", "真人演出"] },
  { id: 'audience', label: '對象', type: 'single', options: ["全部", "闔家觀賞", "付費會員", "年齡限制"] }
];

export function createInitialState() {
  return {
    attributes: new Set(['全部']),
    type: '全部',
    audience: '全部'
  };
}

export function filterAnimes(animes, state) {
  return animes.filter(anime => {
    // Check Type
    if (state.type !== '全部' && !anime.tags.includes(state.type)) return false;
    
    // Check Audience
    if (state.audience !== '全部' && !anime.tags.includes(state.audience)) return false;
    
    // Check Attributes (must have all selected attributes)
    if (!state.attributes.has('全部')) {
      for (const attr of state.attributes) {
        if (!anime.tags.includes(attr)) return false;
      }
    }
    
    return true;
  });
}
```

**Step 4: Run test to verify it passes**
Run: `npm run test`
Expected: PASS

**Step 5: Commit**
```bash
git add src/filterLogic.js src/filterLogic.test.js
git commit -m "feat: implement core filtering logic and config"
```

---

### Task 3: Update DOM Elements & Rendering in index.html and main.js

**Files:**
- Modify: `index.html` (lines 27-29)
- Modify: `src/main.js` (lines 3-100)

**Step 1: Write the failing test**
(No formal test here, we verify DOM rendering manually in browser/Vite).

**Step 2: Write minimal implementation**
Modify `index.html` to remove the `#tags-container` and replace it with `#filter-categories-container`:
```html
<section class="filters-section">
  <div id="filter-categories-container"></div>
</section>
```

Modify `src/main.js`:
- Import logic: `import { FILTER_CONFIG, createInitialState, filterAnimes } from './filterLogic.js';`
- Remove `ALL_TAGS` and old `activeTags`.
- Initialize `let filterState = createInitialState();`
- Replace `renderTags()` with `renderFilterCategories()`:
```javascript
const filterCategoriesContainer = document.getElementById('filter-categories-container');

function renderFilterCategories() {
  filterCategoriesContainer.innerHTML = '';
  
  FILTER_CONFIG.forEach(category => {
    const catEl = document.createElement('div');
    catEl.className = 'filter-category';
    
    let counterHtml = '';
    if (category.type === 'multi') {
      const currentCount = filterState[category.id].has('全部') ? 0 : filterState[category.id].size;
      counterHtml = `<span class="category-counter" id="counter-${category.id}">(${currentCount}/${category.limit})</span>`;
    }

    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `<span class="category-title">${category.label}</span>${counterHtml}`;
    
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'category-tags';
    
    category.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'filter-tag';
      btn.dataset.category = category.id;
      btn.dataset.tag = option;
      btn.textContent = option;
      
      // Check active state
      if (category.type === 'multi') {
        if (filterState[category.id].has(option)) btn.classList.add('active');
      } else {
        if (filterState[category.id] === option) btn.classList.add('active');
      }
      
      btn.addEventListener('click', () => handleTagClick(category, option));
      tagsContainer.appendChild(btn);
    });
    
    catEl.appendChild(header);
    catEl.appendChild(tagsContainer);
    filterCategoriesContainer.appendChild(catEl);
  });
}
```

Update `handleRandomize()` to use the new `filterAnimes`:
```javascript
const filtered = filterAnimes(animeData, filterState);
```

**Step 3: Run test to verify it passes**
Start vite server: `npm run dev`
Expected: Ensure UI correctly loads the headers and tags.

**Step 4: Commit**
```bash
git add index.html src/main.js
git commit -m "feat: render dynamic filter categories"
```

---

### Task 4: Implement Tag Click Logic & Update UI State

**Files:**
- Modify: `src/main.js` (Add `handleTagClick`)
- Modify: `src/style.css` (Add category styles)

**Step 1: Write the failing test**
(Manual verification in browser)

**Step 2: Write minimal implementation**
In `src/main.js`, add `handleTagClick`:
```javascript
function handleTagClick(category, tag) {
  const id = category.id;
  
  if (category.type === 'multi') {
    if (tag === '全部') {
      filterState[id].clear();
      filterState[id].add('全部');
    } else {
      if (filterState[id].has('全部')) {
        filterState[id].delete('全部');
      }
      
      if (filterState[id].has(tag)) {
        filterState[id].delete(tag);
      } else {
        if (filterState[id].size >= category.limit) {
          alert(`最多只能選擇 ${category.limit} 個屬性`);
          return;
        }
        filterState[id].add(tag);
      }
      
      if (filterState[id].size === 0) {
        filterState[id].add('全部');
      }
    }
  } else {
    // Single select
    filterState[id] = tag;
  }
  
  // Re-render UI to update classes and counters
  renderFilterCategories();
}
```

In `src/style.css`, add styles for the new layout:
```css
.filter-category {
  margin-bottom: 1.5rem;
}
.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.category-title {
  font-weight: 700;
  color: #333;
}
.category-counter {
  font-size: 0.9rem;
  color: #666;
}
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

**Step 3: Run test to verify it passes**
Check browser: Try clicking tags, verify counter updates, verify single vs multi behavior, and verify randomizer correctly filters.

**Step 4: Commit**
```bash
git add src/main.js src/style.css
git commit -m "feat: implement tag selection logic and styles"
```
