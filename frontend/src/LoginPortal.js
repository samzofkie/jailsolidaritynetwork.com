import { Component } from "@samzofkie/component";
import { Field } from "./Inputs";
import { Spinner } from "./Spinner";

class LoginButton extends Component {
  constructor() {
    super(
      'div',
      {
        borderRadius: 15,
        padding: 10,
        backgroundColor: '#406950',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: 18,
        boxSizing: 'border-box',
        width: '100%',
      },
      'Login',
    );
    this.set({
      onmouseover: _ => this.flipColors(),
      onmouseout: _ => this.flipColors(),
    });
  }

  flipColors() {
    this.set({
      backgroundColor: this.root.style.color,
      color: this.root.style.backgroundColor,
    });
  }
}

function hide(component) { component.set({display: 'none'}); }
function show(component) { component.set({display: 'block'}); }

export class LoginPortal extends Component {
  constructor() {
    const fieldOptions = {
      inputOptions: {
        fontSize: 18,        
        backgroundColor: '#406950',
        color: 'white',
        padding: 10,
        borderRadius: 15,
        required: true,
        border: 'none',
        boxSizing: 'border-box',
        width: '100%',
      },
      labelOptions: {fontWeight: 'bold', fontSize: 18},
      divOptions: {
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: '30% auto',
        gap: 10,
      },
    }
    super(
      'form',
      {
        backgroundColor: '#69db95',
        borderRadius: 20,
        padding: 10,
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
      },
      new Field({
        type: 'text',
        label: 'Username',
        name: 'username',
        ...fieldOptions,
      }),
      new Field({
        type: 'password',
        label: 'Password',
        name: 'password',
        ...fieldOptions,
      }),
      new Component('div', {display: 'none'}),
      new LoginButton,
    );
    this.inputs = [this.children[0].input, this.children[1].input];
    this.clearInputs = () => this.inputs.map(input => input.set({value: ''}));

    this.spinner = new Spinner;
    hide(this.spinner);
    this.append(this.spinner);

    this.submitButton = this.children[3];
    this.submitButton.set({
      onclick: event => this.upload.call(this, event),
    });

    this.complaintDiv = this.children[2];
    this.complain = message => {
      show(this.complaintDiv);
      this.complaintDiv.root.innerText = '';
      this.complaintDiv.append(message);
    };
  }
  
  upload() {
    hide(this.submitButton);
    show(this.spinner);

    const queryString = new URLSearchParams(new FormData(this.root)).toString();
    fetch('/auth?' + queryString)
      .then(async res => {
        if (res.status !== 200) {
          this.complain(await res.text());
          hide(this.spinner);
          show(this.submitButton);
          this.clearInputs();
        } else {
          const { accessToken } = await res.json();
          localStorage.setItem('accessToken', accessToken);
          window.location.href = '/admin.html';
        }
      });
  }
}