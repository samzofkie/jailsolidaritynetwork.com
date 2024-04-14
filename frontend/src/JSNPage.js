import { Page, Component } from '@samzofkie/component';
import { Header } from './Header.js';
import { Login } from './Login.js';
import { UploadForm } from './UploadForm.js';
 
class JSNPage extends Page {
	constructor(...children) {
		super(
			{
				backgroundColor: '#fff3d4',
				fontFamily: 'Arial, Helvetica, sans-serif',
				boxSizing: 'border-box',
			},
		  ...children,
		);

		this.isMobile = window.innerWidth < 800;
	}
}

export class LandingPage extends JSNPage {
	constructor() {
		super();
		this.append(
			new Header(this.isMobile),
			'landing page',
		);
	}
}

export class ArchivePage extends JSNPage {
	constructor() {
		super(
			new Component('h1', 'archive'),
		);
	}
}

export class AboutPage extends JSNPage {
	constructor() {
		super(
			new Component('h1', 'about the project'),
		);
	}
}

export class ActionPage extends JSNPage {
	constructor() {
		super(
			new Component('h1', 'build with us'),
		);
	}
}

export class LoginPage extends JSNPage {
	constructor() {
		super(
			new Login,
		);
	}
}

export class UploadPage extends JSNPage {
	constructor() {
		super(
			new UploadForm,
		);
	}
}
