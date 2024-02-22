export class Div {
	constructor() {
		this.root = document.createElement('div');
		this.root.className = this.constructor.name;
	}

	style(style) {
		Object.assign(this.root.style, style);
	}
}
