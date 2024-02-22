export class Logo {
	constructor(width = '200px') {
		this.root = document.createElement('img');
		Object.assign(this.root, {
			src: 'jsn-logo-transparent.png',
			alt: 'Jail Solidarity Network logo',
		});
		this.root.style.width = width;
	}
}
