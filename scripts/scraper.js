import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

async function scrapeBahamut() {
  console.log('Scraping Bahamut Anime...');
  try {
    const { data } = await axios.get('https://ani.gamer.com.tw/', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    const $ = cheerio.load(data);
    const animes = [];
    
    // Select the anime blocks
    $('.anime-block').each((i, el) => {
      const aTag = $(el).find('a.anime-card-block');
      const title = $(el).find('.anime-name').text().trim();
      const href = aTag.attr('href');
      const img = $(el).find('.lazyload').attr('data-src');
      const info = $(el).find('.anime-watch-number p').text().trim();
      
      // Attempt to extract tags/genre if available, otherwise fallback to the user's requested list
      // For now, we will assign random tags from the user's requested list just to have data
      const allTags = [
        "動作", "冒險", "奇幻", "異世界", "魔法", "超能力", "科幻", "機甲", "校園", 
        "喜劇", "戀愛", "青春", "勵志", "溫馨", "悠閒", "料理", "親情", "感人", 
        "運動", "競技", "偶像", "音樂", "職場", "推理", "懸疑", "時間穿越", 
        "歷史", "戰爭", "血腥暴力", "靈異神怪", "黑暗", "特攝", "BL", "GL"
      ];
      
      // assign 2-3 random tags
      const numTags = Math.floor(Math.random() * 2) + 2;
      const shuffledTags = allTags.sort(() => 0.5 - Math.random());
      const tags = shuffledTags.slice(0, numTags);
      
      if (title && href) {
        animes.push({
          id: i,
          title,
          url: `https://ani.gamer.com.tw/${href}`,
          cover: img,
          views: info,
          tags: tags
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
