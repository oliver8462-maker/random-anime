import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const dataPath = path.resolve(process.cwd(), 'public/data.json');
let animes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Build a dictionary of animes by title to quickly update tags
const animeDict = {};
animes.forEach(a => {
  a.tags = []; // Reset tags
  animeDict[a.title] = a;
});

const ALL_TAGS = [
  "動作", "冒險", "奇幻", "異世界", "魔法", "超能力", "科幻", "機甲", "校園", 
  "喜劇", "戀愛", "青春", "勵志", "溫馨", "悠閒", "料理", "親情", "感人", 
  "運動", "競技", "偶像", "音樂", "職場", "推理", "懸疑", "時間穿越", 
  "歷史", "戰爭", "血腥暴力", "靈異神怪", "黑暗", "特攝", "BL", "GL"
];

async function fetchTagsFast() {
  console.log(`Starting FAST tag fetching strategy using category pages...`);
  
  for (const tag of ALL_TAGS) {
    let page = 1;
    let keepScraping = true;
    console.log(`\nFetching animes for tag: [${tag}]...`);

    while (keepScraping) {
      try {
        const { data } = await axios.get(`https://ani.gamer.com.tw/animeList.php?tags=${encodeURIComponent(tag)}&page=${page}&sort=1`, {
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const $ = cheerio.load(data);
        const items = $('.theme-list-main');
        
        if (items.length === 0) break; // no more pages for this tag

        let matchedAnyInOurDB = false;

        items.each((i, el) => {
          const title = $(el).find('.theme-name').text().trim();
          
          if (animeDict[title]) {
            matchedAnyInOurDB = true;
            if (!animeDict[title].tags.includes(tag)) {
              animeDict[title].tags.push(tag);
            }
          }
          
          // Remove year limitation
          // Keep scraping until we reach a page with no items in our DB
          const timeText = $(el).find('.theme-time').text().trim();
        });

        // If a whole page has no anime in our DB (meaning we went past 2020 entirely)
        if (!keepScraping) break;

        process.stdout.write(`.`);
        page++;
        await new Promise(r => setTimeout(r, 400)); // Delay to be safe
      } catch (err) {
        console.log(`Error on tag ${tag} page ${page}: ${err.message}`);
        keepScraping = false;
      }
    }
  }

  // Fallback for animes that got no tags
  animes.forEach(a => {
    if (a.tags.length === 0) {
      a.tags = ["全部"];
    } else {
      // "全部" is always included in the UI logic, but let's add it
      if (!a.tags.includes("全部")) a.tags.unshift("全部");
    }
  });

  fs.writeFileSync(dataPath, JSON.stringify(animes, null, 2));
  console.log(`\n\nSuccessfully updated tags for all animes using the FAST strategy!`);
}

fetchTagsFast();
