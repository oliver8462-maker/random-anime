import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const dataPath = path.resolve(process.cwd(), 'public/data.json');
let animes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// To save time and avoid redos, we can check if it has a special flag or just do all
// But let's just do all of them because previous tags were random.
async function fetchTags() {
  console.log(`Starting to fetch real tags for ${animes.length} animes...`);
  let count = 0;
  
  for (let i = 0; i < animes.length; i++) {
    const anime = animes[i];
    
    // Check if we already fetched it (to resume if interrupted)
    if (anime.realTagsFetched) {
      continue;
    }

    try {
      const { data } = await axios.get(anime.url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Cookie': 'BAHAMUT_CGAME=1' // sometimes needed for R18 or mature content
        }
      });
      
      const $ = cheerio.load(data);
      const tags = [];
      
      // Find the tag-list next to the "作品分類" title
      $('.data_type ul.tag-list li.tag').each((idx, el) => {
        tags.push($(el).text().trim());
      });

      // Update anime tags
      if (tags.length > 0) {
        anime.tags = tags;
      } else {
        // Fallback to empty or "未知"
        anime.tags = ["全部"];
      }
      anime.realTagsFetched = true;
      count++;
      
      process.stdout.write(`\rProgress: ${i+1}/${animes.length} (${Math.round(((i+1)/animes.length)*100)}%) - ${anime.title}`);
      
      // Save periodically
      if (count % 20 === 0) {
        fs.writeFileSync(dataPath, JSON.stringify(animes, null, 2));
      }
      
      // Delay to be nice to Bahamut servers
      await new Promise(r => setTimeout(r, 200));
      
    } catch (err) {
      console.log(`\nFailed to fetch tags for ${anime.title} (${anime.url}): ${err.message}`);
    }
  }

  // Final save
  fs.writeFileSync(dataPath, JSON.stringify(animes, null, 2));
  console.log(`\n\nSuccessfully fetched tags for ${count} animes!`);
}

fetchTags();
