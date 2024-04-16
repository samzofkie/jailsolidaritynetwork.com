import { Component } from '@samzofkie/component';
import { TranscriptionEditor } from './TranscriptionEditor.js';
import { Field, Section } from './Inputs.js';


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
        { action: 'testimony' },
        new Component(
          'div',
          {
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '10px',
          },
          new Field({
            type: 'date',
            label: 'Date recieved: ',
            caption: '(day will be ignored)',
            name: 'dateRecieved',
          }),
          new Section(
            'Division: ',
            ...['2', '3', '4', '6', '9', '10', '11', '14', 'Cermak', 'Solitary']
              .map(division => new Field({
                type: 'checkbox',
                label: division,
                name: 'division' + division,
                inputFirst: true,
              }))
          ),
          new Field({
            type: 'text',
            label: 'Length of stay: ',
            caption: '(in months)',
            name: 'lengthOfStay',
          }),
          new Section(
            'Gender: ',
            ...['Male', 'Female', 'Non-binary', 'Other']
              .map(gender => new Field({
                type: 'radio',
                label: gender,
                name: 'gender',
                inputFirst: true,
              })),
          ),
          new TranscriptionEditor,
          new Field({
            type: 'file',
            label: 'Files: ',
            caption: '(select all at once please)',
            name: 'files',
            multiple: true,
          }),
          new Field(
            {
              type: 'submit',
              inputOptions: {
                value: 'Submit testimony',
              }
            },
          ),
        ),
      ),
    );
  }
}
