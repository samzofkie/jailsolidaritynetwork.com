import TestimonyDeck from './src/TestimonyDeck.js';

document.documentElement.style.scrollBehavior = 'smooth';
document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'border-box';

let logoImage = document.createElement('img');
logoImage.src = 'jsn-logo-transparent.png';
logoImage.alt = 'Jail Solidarity Network logo';
logoImage.width = '500';
document.body.appendChild(logoImage);

let deck = new TestimonyDeck();
