import { Div } from './Div.js';
import { Logo } from './Logo.js';

export class Header extends Div {
	constructor() {
		super();
	}
}

export class IndexPageHeader extends Header {
	constructor(cardWidth, numColumns) {
		super();

		this.cardWidth = cardWidth;
		this.numColumns = numColumns;
		this.logo = new Logo(`${this.cardWidth}px`);
		
		if (this.numColumns > 1)
			Object.assign(this.root.style, {
				display: 'grid',
				gridTemplateColumns: 	`repeat(${this.numColumns}, ${100 / this.numColumns}%)`
			});

		this.createLogoDiv();
		this.createLinksDiv();
		this.createSearchLink();
		this.createHr();
		this.createSubtitle();
	}

	createLogoDiv() {
		this.logoDiv = document.createElement('div');
		this.logoDiv.append(this.logo.root);
		this.root.append(this.logoDiv);
	}

	createLinksDiv() {
    // This colDiv div is so the links start halfway down the height of the
    // logo for nicer page scanning for the user
    let colDiv = document.createElement('div');
    colDiv.style.display = 'grid';
    colDiv.style.gridTemplateRows = '50% 50%';

    this.linksDiv = document.createElement('div');
		Object.assign(this.linksDiv.style, {
			gridRowStart: '2',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-end',
			maxHeight: this.logoDiv.offsetHeight / 2,
		});
		colDiv.append(this.linksDiv);
    this.root.append(colDiv);
  }
	
	createSearchLink() {
    let link = document.createElement('a');
    link.href = '/search.html';
		Object.assign(link.style, {
			fontSize: '20px',
			margin: '5px',
		});

    let icon = document.createElement('i');
    icon.className = 'fa fa-search';
    icon.style.marginRight = '10px';
    link.append(icon);

    link.append('Search jail testimonies by topic');

    this.linksDiv.append(link);
	}

	createHr() {
		let hrDiv = document.createElement('div');
		hrDiv.style.gridColumn = '1/-1';
		this.hr = document.createElement('hr');
		hrDiv.append(this.hr);
		this.root.append(hrDiv);
	}

	createSubtitle() {
		let subtitle = document.createElement('h3');
		subtitle.style.gridColumn = '1/-1';
		subtitle.append('These interviews and letters are accounts of the lives impacted by the Cook County Jail in Chicago, IL.');
		this.root.append(subtitle);
	}
}

export class TestimonyPageHeader extends Header {
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
}
