/*import Header from './src/Header.js';
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
let deck = new TestimonyDeck(cardWidth, numColumns);*/

import { IndexPage } from './src/Page.js';
let page = new IndexPage();

//import { Leaf, Branch, /*Root,*/ Spinner } from './src/test.js';
//let branch = new Branch(['h3', Spinner]);
//document.body.append(branch.root);

/*let h = document.createElement('h3');
h.append('Sam');
document.body.append(h);

let d = document.createElement('div');
d.className = 'd';
Object.assign(d.style, {
	display: 'grid',
	gridTemplateColumns: '300px 300px',
});
document.body.append(d);

let e = document.createElement('div');
Object.assign(e.style, {
	border: '2px solid blue',
});
e.append('child text bro');
d.append(e);*/
