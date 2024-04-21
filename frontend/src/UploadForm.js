import { Component } from '@samzofkie/component';
import { TranscriptionEditor } from './TranscriptionEditor.js';
import { Field, Section } from './Inputs.js';
import { Spinner } from './Spinner.js';

export class UploadForm extends Component {
  constructor() {
    super('form', {
      display: 'flex',
      flexFlow: 'column wrap',
      gap: '10px',
      alignItems: 'flex-start',

      enctype: 'multipart/form-data',
    });

    this.date = new Field({
      type: 'date',
      label: 'Date recieved: ',
      caption: '(day will be ignored)',
      name: 'dateRecieved',
      required: true,
    });

    this.division = new Section(
      'Division: ',
      ...['2', '3', '4', '6', '9', '10', '11', '14', 'Cermak', 'Solitary']
        .map(division => new Field({
          type: 'checkbox',
          label: division,
          name: 'division' + division,
          inputFirst: true,
        }))
    );

    this.lengthOfStay = new Field({
      type: 'text',
      label: 'Length of stay: ',
      caption: '(in months)',
      name: 'lengthOfStay',
      required: true,
      inputOptions: {pattern: '[0-9]*'}
    });

    this.gender = new Section(
      'Gender: ',
      ...['Male', 'Female', 'Non-binary', 'Other']
        .map((gender, i) => new Field({
          type: 'radio',
          label: gender,
          name: 'gender',
          inputFirst: true,
          inputOptions: {
            value: gender,
            checked: i === 0 ? true : '',
          },
          required: true,
        })),
    );

    this.editor = new TranscriptionEditor;

    this.files = new Field({
      type: 'file',
      label: 'Files: ',
      caption: '(select all at once please)',
      name: 'files',
      multiple: true,
    });

    this.password = new Field({
      type: 'text',
      label: 'Password: ',
      name: 'password',
      labelOptions: {fontWeight: 'bold'},
      required: true,
    });

    this.complaint = new Component('span', {color: 'red'});
    this.complaint.hide();

    this.submit = new Component(
      'button',
      {
        type: 'submit',
        onclick: event => this.upload(event),
      },
      'Upload testimony',
    );

    this.spinner = new Spinner;
    this.spinner.hide();

    this.append(
      this.date,
      this.division,
      this.lengthOfStay,
      this.gender,
      this.editor,
      this.files,
      this.password,
      this.complaint,
      this.submit,
      this.spinner,
    );

    this.inputs = [
      this.date.input,
      ...this.division.getInputs(),
      this.lengthOfStay.input,
      ...this.gender.getInputs(),
      this.editor.input,
      this.files.input,
      this.password.input,
    ];
  }

  allInputsValid() {
    return this.inputs.reduce(
      (acc, curr) => acc && curr.root.validity.valid,
      true,
    );
  }

  highlightInvalidInputs() {
    this.inputs
      .filter(input => !input.root.validity.valid)
      .map(input => input.set({border: '5px solid red'}));
  }

  unhighlightAllInputs() {
    this.inputs.map(input => input.set({border: null}))
  }

  complain(message) {
    this.complaint.root.innerText = message;
    this.complaint.show();
  }

  upload(event) {
    event.preventDefault();
    this.unhighlightAllInputs();
    this.complaint.hide();

    if (!this.allInputsValid()) {
      this.complain('Please fill out the highlighted inputs!');
      this.highlightInvalidInputs();
      return;
    }

    let formData = new FormData(this.root);

    const divisions = [...formData.entries()]
      .filter(([field, _]) => field.slice(0, 'division'.length) === 'division')
      .map(([division, _]) => division.slice('division'.length));

    divisions.map(division => formData.delete('division' + division))

    formData.append('divisions', divisions);

    this.spinner.show();
    this.submit.hide();

    fetch("/testimony", {
        method: 'POST',
        body: formData,
    })
      .then(res => {
        if (res.status === 401) {
          this.complain('You managed to send an upload request without a password field. That\'s weird');
        } else if (res.status === 403) {
          this.complain('The server is saying this password is incorrect. Try again?');
        } else if (res.status === 200) {
          this.complaint.set({color: 'green'});
          this.complain('Submission accepted!');
        }
        this.spinner.hide();
        this.submit.show();
      })
      .catch(err => console.error);
  }
}