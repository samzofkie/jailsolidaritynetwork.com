export default class Header {
  constructor(cardWidth, numColumns) {
    this.cardWidth = cardWidth;
    this.numColumns = numColumns;
    this.createRootDiv();

    this.createLogoDiv();
    this.createLinksDiv();
    this.createSearchLink();
    this.createHr();

    this.createSubtitle();
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
    let link = document.createElement('a');
    link.href = '/search.html';
    link.style.fontSize = '20px';

    let icon = document.createElement('i');
    icon.className = 'fa fa-search';
    icon.style.marginRight = '10px';
    link.append(icon);

    link.append('Search jail testimonies by topic');

    this.linksDiv.append(link);
  }

  createHr() {
    this.hr = document.createElement('hr');
    document.body.append(this.hr);
  }

  createSubtitle() {
    let subtitle = document.createElement('h3');
    subtitle.append(
      'These interviews and letters are accounts of the lives impacted by the Cook County Jail in Chicago, IL.',
    );
    document.body.append(subtitle);
  }
}
