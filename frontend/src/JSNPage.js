import { Page, Component } from '@samzofkie/component';
import { Header } from './Header.js';
import { Login } from './Login.js';
import { UploadForm } from './UploadForm.js';
 
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
		this.append('landing page');
	}
}

export class ArchivePage extends JSNPage {
	constructor() {
		super();
		this.append(new Component('h1', 'archive'));
	}
}

export class AboutPage extends JSNPage {
	constructor() {
		super();
		this.append(new Component('h1', 'about the project'));
	}
}

export class ActionPage extends JSNPage {
	constructor() {
		super();
		this.append(new Component('h1', 'build with us'))
	}
}

export class LoginPage extends JSNPage {
	constructor() {
		super();
		this.append(new Login);
	}
}

export class UploadPage extends JSNPage {
	constructor() {
		super();
		this.append(new UploadForm);
	}
}
