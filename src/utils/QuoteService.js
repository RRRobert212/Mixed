// utils/QuoteService.js
import quotes from '../../assets/quotes.json';

export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];
  
  return {
    words: selectedQuote.words,
    attribution: selectedQuote.attribution
  };
}