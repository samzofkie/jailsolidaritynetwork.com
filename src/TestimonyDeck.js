import { AudioTestimonyCard, DocumentTestimonyCard } from './TestimonyCard.js';

export default class TestimonyDeck {
  constructor() {
    this.fetchTestimoniesManifest().then((testimonies) => {
      this.testimonies = testimonies;
      this.cardWidth =
        window.innerWidth <= 1000 ? window.innerWidth * 0.95 : 500;

      this.createRootDiv();
      this.shuffleTestimonies();
      this.createTestimonyCards();
      this.createColumnDivs();
      this.awaitImagesLoaded().then((_) => {
        this.divvyCardsIntoColumns();
      });
    });
  }

  fetchTestimoniesManifest() {
    return fetch('manifest.json')
      .then((res) => res.json())
      .then((manifest) => manifest.testimonies);
  }

  createRootDiv() {
    this.rootDiv = document.createElement('div');
    document.body.append(this.rootDiv);
  }

  shuffleTestimonies() {
    // https://stackoverflow.com/a/12646864
    for (let i = this.testimonies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.testimonies[i], this.testimonies[j]] = [
        this.testimonies[j],
        this.testimonies[i],
      ];
    }
  }

  createTestimonyCards() {
    this.testimonyCards = [];
    for (let testimony of this.testimonies) {
      if (testimony.type === 'audio') {
        this.testimonyCards.push(
          new AudioTestimonyCard(testimony, this.cardWidth),
        );
      } else if (testimony.type === 'document') {
        this.testimonyCards.push(
          new DocumentTestimonyCard(testimony, this.cardWidth),
        );
      }
    }
  }

  createColumnDivs() {
    this.numColumns = Math.floor(this.rootDiv.offsetWidth / this.cardWidth);

    this.rootDiv.style.display = 'grid';
    this.rootDiv.style.gridTemplateColumns = `repeat(${this.numColumns}, ${100 / this.numColumns}%)`;

    this.columnDivs = new Array(this.numColumns).fill(0).map((_) => {
      let columnDiv = document.createElement('div');
      this.rootDiv.append(columnDiv);
      return columnDiv;
    });
  }

  awaitImagesLoaded() {
    return Promise.all(
      this.testimonyCards
        .filter((card) => card.type === 'document')
        .map((card) => {
          return new Promise((res, rej) => {
            card.previewImage.addEventListener('load', res);
          });
        }),
    );
  }

  divvyCardsIntoColumns() {
    let columnStarts = this.columnDivs.map((_) => 0);
    for (let i = 0; i < this.testimonyCards.length; i++) {
      const columnNum = columnStarts.indexOf(Math.min(...columnStarts));
      this.columnDivs[columnNum].append(this.testimonyCards[i].rootDiv);
      columnStarts[columnNum] += this.testimonyCards[i].rootDiv.offsetHeight;
    }
  }
}
