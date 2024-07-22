import { Component } from '@samzofkie/component';

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
        borderRadius: 20,
        padding: 10,
        backgroundColor: 'black',

        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gap: 10,
      },
      data.files.length ? 
        new Component('img', {src: `${data.id}-preview.png`, width: 200, overflow: 'hidden'})
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
    console.log(data);
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
      }
    );

    fetch('/testimonies')
      .then(res => res.json())
      .then(testimonies => {
        this.append(
          ...testimonies.map(t => new TestimonyEditCard(t))
        );
      });
  }
} 