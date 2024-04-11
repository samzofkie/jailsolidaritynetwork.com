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

export let Store = {};