/*
	(This comment is also replicated in scraper/get_properties_and_attributes.py)

	Currently, the only properties that are in both cssProperties and 
	htmlAtrributes are
	  - `border`
		- `color`
		- `content`
		- `height`
		- `translate`
		- `width`
	Of these, all except for `content` are no longer supported or unequivocally
	best handled by CSS.

	`content` has two different meaningful meanings in both HTML and CSS.
	However, the programming style encouraged by this framework would use
	JavaScript to implement the functionality provided by CSS's `content`, so we
	deem `content` an HTML attribute (it's possible that `content` could be
	implemented in either way, depending on the tag of the Component, since it's
	HTML meaning currently only applies to `<meta>` elements).

	Filtering both arrays for these properties is done in 
	scraper/get_properties_and_attributes.py, so these arrays are imported wholly
	distinct.
*/
import { cssProperties } from './scraper/cssProperties.js';
import { htmlAttributes } from './scraper/htmlAttributes.js';

class Root {
	constructor() {
		let [root, ...args] = [...arguments];
		
		this.root = root;

		if (!args.length)
			return;

		if (!(args[0] instanceof Root) && typeof args[0] !== 'string') {
			this.set(args.shift());
		}

		this.append(...args);
	}

	set(options) {
		Object.entries(options).map(([key, value]) => {
			if (cssProperties.includes(key)) {
				this.root.style[key] = value;
			} else if (htmlAttributes.includes(key)) {
				this.root[key] = value;
			} else {
				console.warn(`'${key}' is neither an HTML attribute nor a valid CSS property! Attempting to set it may result in unintended consequences...`)
			}
		});
	}

	append() {
		this.root.append(...[...arguments].map(component => 
			typeof component === 'string'? component : component.root
		));
	}

	remove() {
		this.root.remove();
	}
}

export class Page extends Root {
	constructor() {
		super(document.body, ...arguments);
	}
}

export class Component extends Root {
	constructor(elemType, ...other) {
		super(document.createElement(elemType), ...other);
		this.setClassName();
	}

	setClassName() {
		if (this.constructor.name !== 'Component' && this.root.className === '')
			this.root.className = this.constructor.name;
	}
}

export let Store = {};