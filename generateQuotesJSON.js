// generateQuotesJSON.js

const fs = require('fs');

const input = fs.readFileSync('quotes-shakespeare-comedies-raw.txt', 'utf-8');

const quotes = input
  .split('\n')
  .filter(line => line.trim().length > 0)
  .map(line => {
    const [quote, attribution] = line.split('|').map(s => s.trim());
    const words = quote.split(/\s+/);
    return {
      words,
      attribution
    };
  })
  .sort((a, b) => a.words.length - b.words.length); // sort by number of words

fs.writeFileSync(
  'assets/quote-packs/quotes-shakespeare-comedies.json',
  JSON.stringify(quotes, null, 2)
);

console.log('✅ quotes.json generated with', quotes.length, 'quotes.');
