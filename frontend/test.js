import { Page, Component } from '@samzofkie/component';

class SamPage extends Page {
  constructor() {
    super(...arguments);
    this.style({
      backgroundColor: 'gray',
      fontFamily: 'Arial, Helvetica, sans-serif',
    });
  }
}

class BlackBox extends Component {
  constructor() {
    super(
      'div',
      {
        border: '3px solid gray',
        borderRadius: '20px',
        backgroundColor: 'black',
        color: 'white',
      },
      'black box',
    );
  }
}

class Unstyled extends Component {
  constructor() {
    super('div', new BlackBox());
  }
}

let page = new SamPage(
  new BlackBox(),
  new Unstyled(),
  new Component(
    'div',
    {
      color: 'red',
      backgroundColor: 'black',
    },
    'Sam',
  ),
);
