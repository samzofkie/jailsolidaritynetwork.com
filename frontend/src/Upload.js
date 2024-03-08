import { Component } from './Component.js';

class LabeledInput extends Component {
  constructor(name, type, inputType = 'input') {
    super('div');
    this.style({
      paddingBottom: '5px',
    })
    let camelCase = name.split(' ').map(word => this.capitalizeFirstLetter(word)).join('');
    
    this.label = new Component('label');
    this.label.root.for = camelCase;
    this.label.root.innerText = name + ': ';

    this.input = new Component(inputType);
    if (inputType === 'input')
      this.input.root.type = type;
    this.input.root.id = camelCase;
    this.input.root.name = camelCase;

    this.append(this.label, this.input);
  }

  capitalizeFirstLetter(word) {
    let firstChar = word.charAt(0).toUpperCase();
    let remainder = word.slice(1);
    return firstChar + remainder;
  }
}

class DateInput extends LabeledInput {
  constructor(name) {
    super(name, 'date');
  }
}

class TextInput extends LabeledInput {
  constructor(name) {
    super(name, 'text');
  }
}

class TranscriptionInput extends LabeledInput {
  constructor() {
    super('Testimony transcription', '', 'textarea');
    this.input.style({
      width: '98%',
      height: '100px',
      margin: 'auto',
      marginBottom: '10px',
    });

    this.annotateButton = new Component('button', 'Annotate transcription');
    this.annotateButton.style({marginBottom: '10px',});

    this.append(this.annotateButton);
  }
}

class FileInput extends LabeledInput {
  constructor(name) {
    super(name, 'file');
  }
}

class UploadForm extends Component {
  constructor() {
    super('form');
    this.root.action = 'upload';

    this.submitButton = new Component('input');
    this.submitButton.root.type = 'submit';
    this.submitButton.root.value = 'Submit';

    this.append(
      new DateInput('Date (day will be ignored)'),
      new TextInput('Location'),
      new TranscriptionInput(),
      new FileInput('Files'),
      this.submitButton,
    );
  }
}

export class Upload extends Component {
  constructor() {
    super('div');
    this.style({
      width: '70%',
      margin: 'auto',
      border: '3px solid black',
      borderRadius: '30px',
      padding: '10px',
    });

    this.append(
      new Component('h1', 'Upload new testimony'),
      new Component('hr'),
      new UploadForm,
    );
  }
}