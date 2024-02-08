import Header from './src/Header.js';
import TestimonyDeck from './src/TestimonyDeck.js';

document.documentElement.style.scrollBehavior = 'smooth';
document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'border-box';

// These values are calculated here and passed down to header and deck to
// achieve a more consistent layout grid across the page.
const cardWidth = window.innerWidth <= 1000 ? window.innerWidth - 40 : 500;
const numColumns = Math.floor(window.innerWidth / cardWidth);

let header = new Header(cardWidth, numColumns);
let deck = new TestimonyDeck(cardWidth, numColumns);
