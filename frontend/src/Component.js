class Root {
	style(style) {
		Object.assign(this.root.style, style);
	}

	append() {
		this.root.append(...[...arguments].map(component => 
			typeof component === 'string'? component : component.root
		));
	}

	remove() {
		this.root.remove();
	}

	height() {
		//if (this.root.offsetHeight !== 0)
			//return this.root.offsetHeight;
		//else {
			// https://stackoverflow.com/a/27729544
			this.root.style.visibility = 'hidden';
			document.body.append(this.root);
			let height = this.root.offsetHeight;
			this.root.style.visibility = 'visible';
			this.root.remove();
			return height;
		//}
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
