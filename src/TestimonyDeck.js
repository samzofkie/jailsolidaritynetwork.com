import { AudioTestimonyCard, DocumentTestimonyCard } from './TestimonyCard.js';

export default class TestimonyDeck {
  constructor() {
    this.fetchTestimoniesManifest();
    this.testimonies.then((t) => {
      this.testimonies = t;
      this.shuffleTestimonies();
      this.createTestimonyCards();
    });
  }

  fetchTestimoniesManifest() {
    this.testimonies = fetch('manifest.json')
      .then((res) => res.json())
      .then((manifest) => manifest.testimonies);
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
        this.testimonyCards.push(new AudioTestimonyCard(testimony));
      } else if (testimony.type === 'document') {
        this.testimonyCards.push(new DocumentTestimonyCard(testimony));
      }
    }
  }
}
