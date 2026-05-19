const cheerio = require('cheerio');
const fs = require('fs');
const $ = cheerio.load(fs.readFileSync('list.html'));
console.log('theme-list-main items:', $('.theme-list-main').length);
if ($('.theme-list-main').length) {
  console.log($('.theme-list-main').first().html());
}
console.log('pagination a tags:', $('.page_number a').length);
$('.page_number a').each((i, el) => {
  console.log($(el).attr('href'), $(el).text());
});
