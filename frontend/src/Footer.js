import { Component } from "@samzofkie/component";

export class Footer extends Component {
  constructor() {
    super(
      'footer',
      {
        color: '#6b6b6b',
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
      },
      new Component('p', 'Copyright © 2024 Jail Solidarity Network'),
      new Component('p', '•'),
      new Component('p',
        new Component('a', {href: 'login.html'}, 'Login')
      ),
    );
  }
}