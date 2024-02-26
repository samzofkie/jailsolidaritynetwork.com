import { Page, Component } from './Component.js';
import { Header } from './Header.js';
 
class JSNPage extends Page {
	constructor() {
		super();
		
		this.isMobile = window.innerWidth < 800;

		this.style({
			backgroundColor: '#fff3d4',
			fontFamily: 'Arial, Helvetica, sans-serif',
			boxSizing: 'border-box',
		});
	}
}

export class LandingPage extends JSNPage {
	constructor() {
		super();
		this.append(new Header(this.isMobile));
		for (let i=0; i<1000; i++)
			this.append('landing page');
	}
}
	