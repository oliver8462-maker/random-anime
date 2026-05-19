import axios from 'axios';
import fs from 'fs';

async function run() {
  try {
    const { data } = await axios.get('https://ani.gamer.com.tw/animeList.php', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    fs.writeFileSync('scratch/animeList.html', data);
  } catch(e) {
    console.error(e.message);
  }
}
run();
