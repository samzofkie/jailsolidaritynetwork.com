import { Component } from '@samzofkie/component';

class AddTestimonyButton extends Component {
  constructor() {
    super(
      'div',
      {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 30,
        width: 'fit-content',
        cursor: 'pointer',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        alignSelf: 'flex-start',
        border: '2px solid black',
      },
      new Component('span', {fontSize: 36}, '+'),
      'Upload new testimony',
    );
    this.set({
      onmouseover: _ => this.flipColors(),
      onmouseout: _ => this.flipColors(),
      onclick: _ => window.location.href = '/upload.html'
    });
  }

  flipColors() {
    this.set({
      backgroundColor: this.root.style.color,
      color: this.root.style.backgroundColor,
    });
  }
}

class TestimonyEditCard extends Component {
  constructor(data) {
    function divPair(label, datum) {
      return [
        new Component('div', {textAlign: 'right'}, label),
        new Component('div', {fontWeight: 'bold'}, datum),
      ];
    }

    data.lengthOfStay = null;

    super(
      'div',
      {
        borderRadius: 30,
        padding: 10,
        backgroundColor: 'black',

        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gap: 10,
      },
      data.files.length ? 
        new Component('img', {src: `documents/${data.testimonyId}.jpg`, width: 200, overflow: 'hidden'})
        : new Component('div', {width: 200}, ' '),
      new Component(
        'div',
        {
          display: 'grid',
          gridTemplateColumns: 'auto auto',
          gridTemplateRows: 'repeat(6, min-content)',
          columnGap: 10,
        },
        ...divPair('ID: ', data.testimonyId.toString()),
      )
    );

    this.container = this.children[1];

    if (data.dateReceived)
      this.container.append(...divPair('Date: ', data.dateReceived));

    if (data.lengthOfStay?.toString())
      this.container.append(
        ...divPair('Length of incarceration: ', data.lengthOfStay.toString() + ' months')
      );

    if (data.gender) 
      this.container.append(...divPair('Gender: ', data.gender));

    if (data.divisions?.length)
      this.container.append(
        new Component('div', {textAlign: 'right'}, 'Divisions'),
        new Component('div', {fontWeight: 'bold'}, data.divisions.toString()),
      );
  }
}

export class AdminEditDisplay extends Component {
  constructor() {
    super(
      'div',
      {
        color: 'white',
        width: 'fit-content',
        margin: 'auto',
        marginTop: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'stretch',
      },
    );

    fetch('/testimonies')
      .then(res => res.json())
      .then(res => {
        const testimonies = res.data.items;
        this.append(
          new AddTestimonyButton,
          ...(testimonies.length ?
            testimonies.map(t => new TestimonyEditCard(t))
            : ['No testimonies in database!']),
        );
      });
  }
} 