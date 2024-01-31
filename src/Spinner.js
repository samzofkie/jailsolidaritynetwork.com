export default class Spinner {
	constructor(width, borderWidth = 3, primaryColor = "#000000", secondaryColor = "#ffffff", speed = 1) {
		this.div = document.createElement('div');
		this.div.className = 'spinner';
		let style = this.div.style;
		style.border = `${borderWidth}px solid ${secondaryColor}`;
		style.borderRadius = '50%';
		style.borderTop = `${borderWidth}px solid ${primaryColor}`;
		style.height = `${width}px`;
		style.width = `${width}px`;
		style.animation = `spin ${speed}s linear infinite`;
	}
}
