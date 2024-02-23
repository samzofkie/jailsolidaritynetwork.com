export class Root {
	style(style) {
		Object.assign(this.root.style, style);
	}

	append(node) {
		this.root.append(node.root);
	}
}

export class Custom extends Root {
	constructor(type) {
		super();
		this.root = document.createElement(type);
	}
}

export class Div extends Custom {
	constructor() {
		super('div');
		this.root.className = this.constructor.name;
	}
}

export class Link extends Custom {
	constructor(href, text) {
		super('a');
		this.root.href = href;	
		this.root.append(...text);
	}
}
