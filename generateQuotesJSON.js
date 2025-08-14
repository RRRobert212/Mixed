// generateQuotesJSON.js

const fs = require('fs');

const input = fs.readFileSync('quotes-raw copy.txt', 'utf-8');

const quotes = input
  .split('\n')
  .filter(line => line.trim().length > 0)
  .map(line => {
    const [quote, attribution] = line.split('|').map(s => s.trim());
    return {
      words: quote.split(/\s+/), // split into words
      attribution
    };
  });

fs.writeFileSync('assets/quotes.json', JSON.stringify(quotes, null, 2));

console.log('✅ quotes.json generated with', quotes.length, 'quotes.');