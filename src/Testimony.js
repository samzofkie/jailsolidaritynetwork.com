import { Div } from './Root.js';
import { Spinner } from './Spinner.js';

export class Testimony {
	
}

export class TestimonyDeck extends Div {
	constructor(cardWidth, numColumns) {
		super();
		this.cardWidth = cardWidth;
		this.numColumns = numColumns;

		this.spinner = new Spinner(150, 10);
		this.root.append(this.spinner.root);
	}
}
