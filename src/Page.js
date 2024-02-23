import { Root } from './Root.js';
import { IndexPageHeader } from './Header.js';
import { TestimonyDeck } from './Testimony.js';

export class Page extends Root {
	constructor() {
		super();
		this.root = document.body;
		this.isMobile = window.innerWidth < 800;

		this.style({
			backgroundColor: '#b0b0ab',
			fontFamily: 'Arial, Helvetica, sans-serif',
			boxSizing: 'border-box',
		});
	}
}

export class IndexPage extends Page {
	constructor() {
		super();
		
		this.cardWidth = window.innerWidth <= 1000? window.innerWidth - 40 : 500;
		this.numColumns = Math.floor(window.innerWidth / this.cardWidth);
		
		this.append(new IndexPageHeader(this.cardWidth, this.numColumns));
		this.append(new TestimonyDeck(this.cardWidth, this.numColumns));	
	}
}

/*export class TestimonyPage extends Page {
	constructor() {
		super();
		this.urlParams = new URLSearchParams(window.location.search);
		this.testimonyMetadata = Object.fromEntries(this.urlParams);
	}
}

export class AudioTestimonyPage extends TestimonyPage {
	constructor() {
		super();
		
		this.createHeader();
	}

	createHeader() {
		let date = new Date(this.testimonyMetadata.date);
		//this.header = new TestimonyPageHeader(
			//`Recorded ${date.toLocaleString('default', {month: 'long'})}, ${date.getUTCFullYear()}`,
			//this.isMobile,
		//);
		//this.root.append(this.header.root);
		this.header = new AudioTestimonyPageHeader(this.isMobile);
	}
}*/
