import { Component } from '@samzofkie/component';
import { DateInput, TextInput, FileInput, Checkboxes, RadioButtons } from './Inputs.js';
import { TranscriptionEditor } from './TranscriptionEditor.js';

export class UploadForm extends Component {
  constructor() {
    super(
      'div',
      {
        width: '70%',
        margin: 'auto',
        border: '3px solid black',
        borderRadius: '30px',
        padding: '10px',
      },
      new Component('h1', 'Upload new testimony'),
      new Component('hr'),
      new Component(
        'form',
        {
          display: 'flex',
          flexFlow: 'column wrap',
          gap: '10px',
          action: 'testimony',
        },
        new DateInput('Date', '(Day value will be ignored)'),
        new Checkboxes(['2', '3', '4', '6', '9', '10', '11', '14'], {label: 'Division'}),
        new TextInput('Length of stay', '(In months)'),
        new Checkboxes(['Male', 'Female', 'Non-binary', 'Other'], {label: 'Gender'}),
        new TranscriptionEditor,
        new FileInput('Files'),
        new TextInput('Password'),
        new Component(
          'input',
          {
            type: 'submit',
            value: 'Submit',
          }
        ),
      ),
    );
  }
}