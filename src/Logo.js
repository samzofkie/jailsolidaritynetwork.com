export default class Logo {
  constructor(width) {
    this.img = document.createElement('img');
    this.img.src = 'jsn-logo-transparent.png';
    this.img.alt = 'Jail Solidarity Network logo';
    this.img.width = width;
  }
}
