const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('list.html', 'utf8'));

console.log('Categories found:');
$('a[data-ani-list-tag]').each((i, el) => {
  console.log($(el).text().trim(), $(el).attr('href'));
});
