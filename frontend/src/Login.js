import { Component } from '@samzofkie/component';

export class Login extends Component {
  constructor() { 
    super(
      'form',
      {
        action: 'upload'
      },
      new Component(
        'label', 
        {
          for: 'password',
        },
        'Password: '
      ),
      new Component(
        'input',
        {
          type: 'text',
          id: 'password',
          name: 'password',
          required: 'true',
        }
      ),
      new Component(
        'input',
        {
          type: 'submit',
          value: 'Login',
        }
      ),
    );
  }
}