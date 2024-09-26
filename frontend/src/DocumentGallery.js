import { Component } from '@samzofkie/component';

export class DocumentGallery extends Component {
  constructor() {
    super(
      'div',
      {
        display: 'grid',
        gap: 10,
        margin: 10,
      }
    );

    fetch('/testimonies')
      .then(res => res.json())
      .then(res => {
        const testimonies = res.data.items;
        for (const testimony of testimonies) {
          this.append(
            new Component(
              'img',
              {
                src: `documents/${testimony.testimonyId}.jpg`,
                alt: `A thumbnail for testimony ${testimony.testimonyId}`,
                maxHeight: 500,
              }
            )
          );
        }
      });
  }
}