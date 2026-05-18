import './style.css';

// All tags requested by the user
const ALL_TAGS = [
  "全部", "動作", "冒險", "奇幻", "異世界", "魔法", "超能力", "科幻", "機甲", "校園", 
  "喜劇", "戀愛", "青春", "勵志", "溫馨", "悠閒", "料理", "親情", "感人", 
  "運動", "競技", "偶像", "音樂", "職場", "推理", "懸疑", "時間穿越", 
  "歷史", "戰爭", "血腥暴力", "靈異神怪", "黑暗", "特攝", "BL", "GL"
];

let animeData = [];
let activeTags = new Set(["全部"]);

// DOM Elements
const tagsContainer = document.getElementById('tags-container');
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
  renderTags();
  await loadData();
  setupEventListeners();
}

// Render Tag Buttons
function renderTags() {
  ALL_TAGS.forEach(tag => {
    const el = document.createElement('div');
    el.className = 'filter-tag';
    if (tag === '全部') el.classList.add('active');
    el.textContent = tag;
    el.addEventListener('click', () => toggleTag(tag, el));
    tagsContainer.appendChild(el);
  });
}

// Load Scraped Data
async function loadData() {
  try {
    const response = await fetch('/data.json');
    animeData = await response.json();
  } catch (err) {
    console.error('Failed to load anime data:', err);
    animeTitle.textContent = '資料載入失敗，請確認 /data.json 存在';
  }
}

// Toggle Tags Logic
function toggleTag(tag, el) {
  if (tag === '全部') {
    activeTags.clear();
    activeTags.add('全部');
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    return;
  }

  // Remove '全部' if another tag is clicked
  if (activeTags.has('全部')) {
    activeTags.delete('全部');
    document.querySelector('.filter-tag:first-child').classList.remove('active');
  }

  if (activeTags.has(tag)) {
    activeTags.delete(tag);
    el.classList.remove('active');
  } else {
    activeTags.add(tag);
    el.classList.add('active');
  }

  // If no tags selected, fallback to '全部'
  if (activeTags.size === 0) {
    activeTags.add('全部');
    document.querySelector('.filter-tag:first-child').classList.add('active');
  }
}

// Main Randomizer Logic
function setupEventListeners() {
  randomizeBtn.addEventListener('click', handleRandomize);
}

function handleRandomize() {
  if (animeData.length === 0) return;

  // Visual feedback on button
  randomizeBtn.classList.add('loading');
  randomizeBtn.textContent = '正在尋找...';
  
  // Unflip the card if it was flipped
  resultCard.classList.remove('flipped');

  setTimeout(() => {
    const filtered = filterAnimes();
    
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

function filterAnimes() {
  if (activeTags.has('全部')) return animeData;
  
  // Calculate match scores for all animes
  const scoredAnimes = animeData.map(anime => {
    let score = 0;
    anime.tags.forEach(t => {
      if (activeTags.has(t)) score++;
    });
    return { anime, score };
  }).filter(item => item.score > 0); // Only keep those with at least 1 match
  
  if (scoredAnimes.length === 0) return [];
  
  // Find the highest score
  const maxScore = Math.max(...scoredAnimes.map(item => item.score));
  
  // Filter only those with the max score (best match)
  return scoredAnimes
    .filter(item => item.score === maxScore)
    .map(item => item.anime);
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
