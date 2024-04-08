import { Component } from '@samzofkie/component';
import { DateInput, TextInput, FileInput, Checkboxes, RadioButtons } from './Inputs.js';
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
    this.form.root.action = 'testimony';
    this.form.style({
      display: 'flex',
      flexFlow: 'column wrap',
      gap: '10px',
    });

    this.submitButton = new Component('input');
    this.submitButton.root.type = 'submit';
    this.submitButton.root.value = 'Submit';

    this.append(
      new Component('h1', 'Upload new testimony'),
      new Component('hr'),
      this.form,
    );

    this.form.append(
      new DateInput('Date', '(Day value will be ignored)'),
      new Checkboxes(['2', '3', '4', '6', '9', '10', '11', '14'], {label: 'Division'}),
      new TextInput('Length of stay', '(In months)'),
      new Checkboxes(['Male', 'Female', 'Non-binary', 'Other'], {label: 'Gender'}),
      new TranscriptionEditor,
      new FileInput('Files'),
      new TextInput('Password'),
      this.submitButton,
    );
  }
}