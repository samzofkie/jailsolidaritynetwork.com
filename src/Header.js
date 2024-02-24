import { Component } from './Component.js';

class Header extends Component {
	constructor() { super('div'); }
}

class Logo extends Component {
	constructor(width = '200px') {
		super('img');
		
		this.root.src = 'jsn-logo-transparent.png';
		this.root.alt = 'Jail Solidarity Network logo';
		
		this.style({width: width});
	}
}

class SearchIcon extends Component {
	constructor() {
		super('i');
		
		this.root.className = 'fa fa-search';
		
		this.style({
			marginRigt: '10px',
		});
	}
}

class SearchLink extends Component {
	constructor() {
		super('a');
		
		this.root.href = '/search.html';
		
		this.style({
			margin: '5px',
			alignSelf: 'end',
		});

		this.append(
			new SearchIcon,
			'Search jail testimonies by topic'
		);
	}
}

class IndexPageHeaderColumns extends Component {
	constructor(cardWidth, numColumns) {
		super('div');
		
		if (numColumns > 1)
			this.style({
				display: 'grid',
				gridTemplateColumns: `repeat(${this.numColumns}, ${100 / this.numColumns}%)`,
			});
		
		this.append(
			new Logo(`${cardWidth}px`),
			new SearchLink,
		);
	}
}

export class IndexPageHeader extends Header {
	constructor(cardWidth, numColumns) {
		super();	
		
		let subtitleText = `There interview and letters are accounts of the lives 
			impacted by the Cook County Jail in Chicago, IL.`;
	
		this.append(
			new IndexPageHeaderColumns(cardWidth, numColumns),
			new Component('hr'),
			new Component('h3', subtitleText),
		);
	}
}
