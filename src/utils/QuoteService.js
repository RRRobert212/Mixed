// utils/QuoteService.js
import quotes from '../assets/quotes.json';

export function getRandomQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  return {
    words: random.text.split(' '),
    attribution: random.attribution
  };
}
