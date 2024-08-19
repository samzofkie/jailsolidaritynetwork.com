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
        alignSelf: 'flex-end',
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
        new Component('img', {src: `documents/${data.id}-thumbnail.jpg`, width: 200, overflow: 'hidden'})
        : new Component('div', {width: 200}, ' '),
      new Component(
        'div',
        {
          display: 'grid',
          gridTemplateColumns: 'auto auto',
          gridTemplateRows: 'repeat(6, min-content)',
          columnGap: 10,
        },
        ...divPair('ID: ', data.id.toString()),
       ...divPair('Date: ', data.date_received),
       ...divPair('Length of incarceration: ', data.length_of_stay.toString() + ' months'),
       ...divPair('Gender: ', data.gender),
        ...(data.divisions.length ?
          [
            new Component('div', {textAlign: 'right'}, 'Divisions'),
            new Component('div', {fontWeight: 'bold'}, data.divisions.toString())
          ] 
          : [])
      ),
      new Component(
        'div', 
        {
          padding: 5, 
          borderRadius: 20, 
          backgroundColor: 'white', 
          alignSelf: 'end'
        },
        new Component('a', {href: '/upload.html'}, 'edit')
      ),
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
      .then(testimonies => {
        this.append(
          ...(testimonies.length ?
            testimonies.map(t => new TestimonyEditCard(t))
            : ['No testimonies in database!']),
          new AddTestimonyButton,
        );
      });
  }
} 