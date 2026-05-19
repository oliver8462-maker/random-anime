const cheerio = require('cheerio');
const fs = require('fs');
const $ = cheerio.load(fs.readFileSync('detail.html'));
// Look for data-type="category" or something similar.
const tags = [];
$('.data-type li').each((i, el) => {
  if ($(el).text().includes('作品分類')) {
    console.log('Category found!');
  }
});
// Often it's `.data_type` or `.anime_info_detail`
console.log('Finding classes with 作品分類...');
$('*').each((i, el) => {
  if ($(el).text() === '作品分類') {
    console.log('Exact match class:', $(el).attr('class'));
    console.log('Parent HTML:', $(el).parent().html());
  }
});
