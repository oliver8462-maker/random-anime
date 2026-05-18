import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const ALL_TAGS = [
  "動作", "冒險", "奇幻", "異世界", "魔法", "超能力", "科幻", "機甲", "校園", 
  "喜劇", "戀愛", "青春", "勵志", "溫馨", "悠閒", "料理", "親情", "感人", 
  "運動", "競技", "偶像", "音樂", "職場", "推理", "懸疑", "時間穿越", 
  "歷史", "戰爭", "血腥暴力", "靈異神怪", "黑暗", "特攝", "BL", "GL"
];

async function scrapeBahamut() {
  console.log('Scraping Bahamut Anime from 2020 to 2026...');
  const animes = [];
  let page = 1;
  let keepScraping = true;
  let idCounter = 0;

  try {
    while (keepScraping) {
      console.log(`Fetching page ${page}...`);
      const { data } = await axios.get(`https://ani.gamer.com.tw/animeList.php?page=${page}&sort=1`, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      const items = $('.theme-list-main');
      
      if (items.length === 0) break;

      items.each((i, el) => {
        const title = $(el).find('.theme-name').text().trim();
        let href = $(el).attr('href');
        if (href && !href.startsWith('http')) {
          href = `https://ani.gamer.com.tw/${href}`;
        }
        const img = $(el).find('.theme-img').attr('data-src');
        const info = $(el).find('.show-view-number p').text().trim();
        const timeText = $(el).find('.theme-time').text().trim(); // "年份：2026/04"
        
        let year = 9999;
        const yearMatch = timeText.match(/年份：(\d{4})/);
        if (yearMatch) {
          year = parseInt(yearMatch[1], 10);
        }

        if (year < 2020) {
          keepScraping = false;
          return false; // Break the each loop
        }

        if (year <= 2026 && year >= 2020) {
          const numTags = Math.floor(Math.random() * 2) + 2;
          const shuffledTags = [...ALL_TAGS].sort(() => 0.5 - Math.random());
          const tags = shuffledTags.slice(0, numTags);
          
          if (title && href) {
            animes.push({
              id: idCounter++,
              title,
              url: href,
              cover: img,
              views: info,
              tags: tags,
              year: year
            });
          }
        }
      });

      if (!keepScraping) break;
      page++;
      
      // Delay to avoid hitting rate limits
      await new Promise(r => setTimeout(r, 500));
    }

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    fs.writeFileSync(path.join(publicDir, 'data.json'), JSON.stringify(animes, null, 2));
    console.log(`Successfully scraped ${animes.length} animes from 2020-2026 to public/data.json`);
  } catch (err) {
    console.error('Error scraping:', err.message);
  }
}

scrapeBahamut();
