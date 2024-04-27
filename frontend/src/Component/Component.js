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
  constructor(root, ...args) {
    args = args.filter((arg) => arg);

    this.root = root;
    this.children = [];

    if (!args.length) return;

    // If the first argument after `root` is an object that isn't a decendant
    // of `Root`, we'll interpret it as an object specifying HTML attributes
    // and CSS properties to be set, and pass it to `this.set`.
    if (typeof args[0] === 'object' && !(args[0] instanceof Root)) {
      this.set(args.shift());
    }
    
    // Everything else we interpret as a string or Component to be appended
    this.append(...args);
  }

  set(options) {
    Object.entries(options).map(([key, value]) => {
      if (cssProperties.includes(key)) {
        this.root.style[key] = value;
      } else if (htmlAttributes.includes(key)) {
        this.root[key] = value;
      } else {
        console.warn(
          `'${key}' is neither an HTML attribute nor a valid CSS property! Attempting to set it may result in unintended consequences...`,
        );
      }
    });
  }

  append(...components) {
    this.root.append(...components.map(component => 
      typeof component === 'string' ? component : component.root
    ));
    this.children.push(...components);
  }
}

export class Component extends Root {
  constructor(type, ...args) {
    super(document.createElement(type), ...args);
    this.setClassName();
  }

  setClassName() {
    if (this.constructor.name !== 'Component' && this.root.className === '') {
      this.root.className = this.constructor.name;
    }
  }

  hide() {this.set({visibility: 'collapse'});}

  show() {this.set({visibility: 'visible'});}

  remove() {this.root.remove();}
}

export class Page extends Root {
  constructor(title, ...args) {
    super(document.body, ...args);
    this.head = new Root(document.head);
    this.head.append(
      new Component('title', title)
    );
  }
}

export let Store = {};
