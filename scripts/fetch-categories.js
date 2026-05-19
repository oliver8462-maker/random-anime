import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const dataPath = path.resolve(process.cwd(), 'public/data.json');
let animes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Categories to scrape
const CATEGORIES = ["電影", "OVA", "雙語", "泡麵番", "真人演出"];
const TARGETS = ["闔家觀賞", "付費會員", "年齡限制"];

async function scrapeCategory(paramName, paramValue) {
  console.log(`Scraping ${paramName}=${paramValue}...`);
  let page = 1;
  let keepScraping = true;
  let matchedCount = 0;
  
  while (keepScraping) {
    try {
      // Encode param
      const url = `https://ani.gamer.com.tw/animeList.php?${paramName}=${encodeURIComponent(paramValue)}&page=${page}&sort=1`;
      const { data } = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      const items = $('.theme-list-main');
      
      if (items.length === 0) break;
      
      items.each((i, el) => {
        let href = $(el).attr('href');
        if (href && !href.startsWith('http')) {
          href = `https://ani.gamer.com.tw/${href}`;
        }
        
        // Find anime by URL
        const matchedAnime = animes.find(a => a.url === href);
        if (matchedAnime) {
          if (!matchedAnime.tags) matchedAnime.tags = [];
          if (!matchedAnime.tags.includes(paramValue)) {
            matchedAnime.tags.push(paramValue);
            matchedCount++;
          }
        }
      });
      
      page++;
      await new Promise(r => setTimeout(r, 500)); // Delay
    } catch (err) {
      console.error(`Error fetching page ${page}:`, err.message);
      keepScraping = false;
    }
  }
  
  console.log(`Finished ${paramName}=${paramValue}. Added tag to ${matchedCount} animes.`);
}

async function run() {
  for (const cat of CATEGORIES) {
    await scrapeCategory('category', cat);
  }
  for (const target of TARGETS) {
    await scrapeCategory('target', target);
  }
  
  fs.writeFileSync(dataPath, JSON.stringify(animes, null, 2));
  console.log('Successfully updated data.json with Type and Audience tags!');
}

run();
