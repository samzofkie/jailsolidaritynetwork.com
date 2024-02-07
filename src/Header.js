export default class Header {
  constructor(cardWidth, numColumns) {
    this.cardWidth = cardWidth;
    this.numColumns = numColumns;
    this.createRootDiv();

    this.createLogoDiv();
    this.createLinksDiv();
    this.createSearchLink();
    this.createHr();
  }

  createRootDiv() {
    this.rootDiv = document.createElement('div');
    document.body.appendChild(this.rootDiv);
    if (this.numColumns > 1) {
      this.rootDiv.style.display = 'grid';
      this.rootDiv.style.gridTemplateColumns = `repeat(${this.numColumns}, ${100 / this.numColumns}%)`;
    }
  }

  createLogoDiv() {
    this.logoDiv = document.createElement('div');
    let logo = document.createElement('img');
    logo.src = 'jsn-logo-transparent.png';
    logo.alt = 'Jail Solidarity Network logo';
    logo.width = this.cardWidth;
    this.logoDiv.append(logo);
    this.rootDiv.append(this.logoDiv);
    console.log(this.logoDiv);
  }

  createLinksDiv() {
    // This colDiv thing is so the links start halfway down the height of the
    // logo for nicer page scanning for the user
    let colDiv = document.createElement('div');
    colDiv.style.display = 'grid';
    colDiv.style.gridTemplateRows = '50% 50%';

    this.linksDiv = document.createElement('div');
    this.linksDiv.style.gridRowStart = '2';
    this.linksDiv.style.display = 'flex';
    this.linksDiv.style.flexDirection = 'column';
    this.linksDiv.style.maxHeight = this.logoDiv.offsetHeight / 2;
    colDiv.append(this.linksDiv);

    this.rootDiv.append(colDiv);
  }

  createSearchLink() {
    let searchDiv = document.createElement('div');
    searchDiv.style.display = 'flex';
    searchDiv.style.alignItems = 'center';

    let icon = document.createElement('i');
    icon.className = 'fa fa-search';
    icon.style.fontSize = '35px';
    icon.style.marginRight = '10px';
    searchDiv.append(icon);

    let label = document.createElement('p');
    label.append('Search jail testimonies by topic');
    label.style.fontSize = '20px';
    label.style.fontWeight = 'bold';
    label.style.margin = '0px';
    searchDiv.append(label);

    this.linksDiv.append(searchDiv);
  }

  createHr() {
    this.hr = document.createElement('hr');
    document.body.append(this.hr);
  }
}
