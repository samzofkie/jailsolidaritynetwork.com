export default class Spinner {
  constructor(
    width = 25,
    borderWidth = 3,
    primaryColor = '#000000',
    secondaryColor = '#ffffff',
    speed = 1,
  ) {
    this.div = document.createElement('div');
    this.div.className = 'spinner';
    this.div.style.border = `${borderWidth}px solid ${secondaryColor}`;
    this.div.style.borderRadius = '50%';
    this.div.style.borderTop = `${borderWidth}px solid ${primaryColor}`;
    this.div.style.height = `${width}px`;
    this.div.style.width = `${width}px`;
    this.div.style.animation = `spin ${speed}s linear infinite`;
		this.div.style.margin = 'auto';
  }
}
