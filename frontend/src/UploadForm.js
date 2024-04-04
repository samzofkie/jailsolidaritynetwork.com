import { Component } from './Component.js';
import { DateInput, TextInput, FileInput, Checkboxes } from './Inputs.js';
import { TranscriptionEditor } from './TranscriptionEditor.js';

export class UploadForm extends Component {
  constructor() {
    super('div');
    this.style({
      width: '70%',
      margin: 'auto',
      border: '3px solid black',
      borderRadius: '30px',
      padding: '10px',
    });

    this.form = new Component('form');
    this.form.root.action = 'upload';

    this.submitButton = new Component('input');
    this.submitButton.root.type = 'submit';
    this.submitButton.root.value = 'Submit';

    this.append(
      new Component('h1', 'Upload new testimony'),
      new Component('hr'),
      this.form,
    );

    this.form.append(
      new DateInput('Date (day will be ignored)'),
      new Component('label', 'Division: '),
      new Checkboxes(['2', '3', '4', '6', '9', '10', '11', '14']),
      new TextInput('Length of stay'),
      new TextInput('Gender'),
      new TranscriptionEditor,
      new FileInput('Files'),
      new TextInput('Password'),
      this.submitButton,
    );
  }
}