import { Root, Div, Link } from './Root.js';
import { Logo } from './Logo.js';
	
export class Header extends Div {
	createHr() {
		this.root.append(document.createElement('hr'));
	}
}

class SearchLink extends Link {
	constructor() {
		let icon = document.createElement('i');
		icon.className = 'fa fa-search';
    icon.style.marginRight = '10px';

		super('/search.html', [icon, 'Search jail testimonies by topic']);
		
		this.style({
			fontSize: '20px',
			margin: '5px',
			alignSelf: 'end',
		});
	}
}

export class IndexPageHeader extends Header {
	constructor(cardWidth, numColumns) {
		super();

		this.cardWidth = cardWidth;
		this.numColumns = numColumns;
			
		this.createLogoLinksColumns();
		this.createHr();
		this.createSubtitle();
	}

	createLogoLinksColumns() {
		let columns = new Div;
		if (this.numColumns > 1)
			columns.style({
				display: 'grid',
				gridTemplateColumns: 	`repeat(${this.numColumns}, ${100 / this.numColumns}%)`,
			});
		columns.append(new Logo(`${this.cardWidth}px`));
		columns.append(new SearchLink);
		this.append(columns);
	}
	
	createSubtitle() {
		let subtitle = document.createElement('h3');
		subtitle.append('These interviews and letters are accounts of the lives impacted by the Cook County Jail in Chicago, IL.');
		this.root.append(subtitle);
	}
}

/*export class TestimonyPageHeader extends Header {
	constructor(isMobile) {
		super();
		this.isMobile = isMobile;
		this.logo = new Logo(this.isMobile? '50%' : '100%');
	}

	makeRootColumns() {
		Object.assign(this.root.style, {
			width: '100%',
			position: 'fixed',
			top: '0px',
			left: '0px',
		});
		if (!this.isMobile)
			Object.assign(this.root.style, {
				display: 'grid',
				gridTemplateColumns: 'repeat(4, 25%)',
			});
	}

	createLogo() {
		this.root.append(this.logo.root);
		this.logoLoaded = new Promise((res, rej) => {
			this.logo.root.addEventListener('load', res);
		});
	}
}

export class AudioTestimonyPageHeader extends TestimonyPageHeader {
	constructor() {
		super();	
	}
}*/
