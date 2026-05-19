import './style.css';
import { FILTER_CONFIG, createInitialState, filterAnimes } from './filterLogic.js';

let animeData = [];
let filterState = createInitialState();

// DOM Elements
const filterCategoriesContainer = document.getElementById('filter-categories-container');
const randomizeBtn = document.getElementById('randomize-btn');
const resultSection = document.getElementById('result-section');
const resultCard = document.querySelector('.result-card');
const animeCover = document.getElementById('anime-cover');
const animeTitle = document.getElementById('anime-title');
const animeViews = document.getElementById('anime-views');
const animeTags = document.getElementById('anime-tags');
const animeLink = document.getElementById('anime-link');

// Initialize App
async function init() {
  renderFilterCategories();
  await loadData();
  setupEventListeners();
}

// Load Scraped Data
async function loadData() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    animeData = await response.json();
  } catch (err) {
    console.error('Failed to load anime data:', err);
  }
}

// Render Tag Buttons
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

function handleTagClick(category, option) {
  const id = category.id;
  
  if (category.type === 'multi') {
    if (option === '全部') {
      filterState[id].clear();
      filterState[id].add('全部');
    } else {
      if (filterState[id].has('全部')) {
        filterState[id].delete('全部');
      }
      
      if (filterState[id].has(option)) {
        filterState[id].delete(option);
      } else {
        if (filterState[id].size >= category.limit) {
          alert(`最多只能選擇 ${category.limit} 個屬性`);
          return;
        }
        filterState[id].add(option);
      }
      
      if (filterState[id].size === 0) {
        filterState[id].add('全部');
      }
    }
  } else {
    // Single select
    filterState[id] = option;
  }
  
  // Re-render UI to update classes and counters
  renderFilterCategories();
}

// Main Randomizer Logic
function setupEventListeners() {
  randomizeBtn.addEventListener('click', handleRandomize);
}

function handleRandomize() {
  if (animeData.length === 0) {
    alert('資料尚未載入完成或載入失敗，請稍後再試。');
    return;
  }

  // Visual feedback on button
  randomizeBtn.classList.add('loading');
  randomizeBtn.textContent = '正在尋找...';
  
  // Unflip the card if it was flipped
  resultCard.classList.remove('flipped');

  setTimeout(() => {
    const filtered = filterAnimes(animeData, filterState);
    
    if (filtered.length === 0) {
      alert('找不到符合標籤的動畫，請嘗試減少標籤！');
      resetButton();
      return;
    }

    // Pick random
    const randomAnime = filtered[Math.floor(Math.random() * filtered.length)];
    
    // Update Result DOM
    updateResultUI(randomAnime);
    
    // Show section and Flip Card
    resultSection.classList.remove('hidden');
    resultCard.classList.add('flipped');
    
    resetButton();
  }, 1000); // 1s delay for anticipation
}



function updateResultUI(anime) {
  // If no cover, use a placeholder
  animeCover.src = anime.cover || 'https://via.placeholder.com/400x220?text=No+Cover';
  animeTitle.textContent = anime.title;
  animeViews.textContent = `👁 ${anime.views}`;
  animeLink.href = anime.url;
  
  // Clear old tags
  animeTags.innerHTML = '';
  anime.tags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'anime-tag-small';
    span.textContent = t;
    animeTags.appendChild(span);
  });
}

function resetButton() {
  randomizeBtn.classList.remove('loading');
  randomizeBtn.textContent = '幫我決定！';
}

init();
