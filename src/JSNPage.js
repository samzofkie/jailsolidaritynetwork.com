import { Page } from './Component.js';
import { IndexPageHeader } from './Header.js';
import { TestimonyDeck } from './TestimonyDeck.js';

class JSNPage extends Page {
	constructor() {
		super();
		
		this.isMobile = window.innerWidth < 800;

		this.style({
			backgroundColor: '#b0b0ab',
			fontFamily: 'Arial, Helvetica, sans-serif',
			boxSizing: 'border-box',
		});
	}
}

export class IndexPage extends JSNPage {
	constructor() {
		super();
		
		let cardWidth = window.innerWidth <= 1000? window.innerWidth - 40 : 500;
		let numColumns = Math.floor(window.innerWidth / this.cardWidth);

		this.append(
			new IndexPageHeader(cardWidth, numColumns),
			new TestimonyDeck(cardWidth, numColumns),
		);
	}
}
