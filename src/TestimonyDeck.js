import { Component } from './Component.js';
import { Spinner } from './Spinner.js';

export class TestimonyDeck extends Component {
	constructor(cardWidth, numColumns) {
		super('div');
		
		this.append(
			new Spinner(150, 10),
		);

		// fetch
	}
}
