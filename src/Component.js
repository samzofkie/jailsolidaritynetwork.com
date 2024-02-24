class Root {
	style(style) {
		Object.assign(this.root.style, style);
	}

	append() {
		this.root.append(...[...arguments].map(component => 
			typeof component === 'string'? component : component.root
		));
	}
}

export class Page extends Root {
	constructor() {
		super();
		this.root = document.body;
	}
}

export class Component extends Root {
	constructor(type, ...children) {
		super();
		
		this.root = document.createElement(type);
		
		if (this.constructor.name !== 'Component')
			this.root.className = this.constructor.name;
		
		this.append(...children);
	}
}
