import axios from 'axios';
import * as cheerio from 'cheerio';

async function getCategories() {
  const { data } = await axios.get('https://ani.gamer.com.tw/animeList.php', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(data);
  const categories = [];
  $('a[href^="?c="]').each((i, el) => {
    categories.push({
      name: $(el).text().trim(),
      c: $(el).attr('href').split('=')[1]
    });
  });
  console.log(categories);
}
getCategories();
