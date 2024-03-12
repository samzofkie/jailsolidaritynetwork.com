import { Component } from './Component.js';

export class Login extends Component {
  constructor() { 
    super('form');
    this.root.action = 'upload';
    
    let label = document.createElement('label');
    label.for = 'password';
    label.innerText = 'Password: ';
    
    let input = document.createElement('input');
    input.type = 'text';
    input.id = 'password';
    input.name = 'password';
    input.required = 'true';

    let button = document.createElement('input');
    button.type = 'submit';
    button.value = 'Login';

    this.root.append(label);
    this.root.append(input);
    this.root.append(button);
  }
}