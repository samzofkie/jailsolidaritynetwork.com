import { Component } from '@samzofkie/component';
import { TranscriptionEditor } from './TranscriptionEditor.js';
import { Field, FetchedSection } from './Inputs.js';
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
      name: 'dateRecieved',
      caption: '(day will be ignored)',
      inputOptions: {required: true},
    });

    this.division = new FetchedSection(
      'Divisions: ', 
      '/divisions',
      division => new Field({
        type: 'checkbox',
        label: division.name,
        name: 'division' + division.name,
        inputFirst: true,
      })
    );

    this.lengthOfStay = new Field({
      type: 'text',
      label: 'Length of stay: ',
      name: 'lengthOfStay',
      caption: '(in months)',
      inputOptions: {
        required: true,
        pattern: '[0-9]*'
      },
    });

    this.gender = new FetchedSection(
      'Gender: ',
      '/genders',
      (gender, i) => new Field({
        type: 'radio',
        label: gender.name,
        name: 'gender',
        inputFirst: true,
        inputOptions: {
          required: true,
          value: gender.name,
          checked: i === 0 ? true : '',
        },
      })
    );

    this.editor = new TranscriptionEditor;

    this.files = new Field({
      type: 'file',
      label: 'Files: ',
      name: 'files',
      caption: '(select all at once please)',
      inputOptions: {multiple: true},
    });

    this.password = new Field({
      type: 'text',
      label: 'Password: ',
      name: 'password',
      labelOptions: {fontWeight: 'bold'},
      inputOptions: {required: true},
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
  }

  getInputs() {
    return [
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
    return this.getInputs().reduce(
      (acc, curr) => acc && curr.root.validity.valid,
      true,
    );
  }

  highlightInvalidInputs() {
    this.getInputs()
      .filter(input => !input.root.validity.valid)
      .map(input => input.set({border: '5px solid red'}));
  }

  unhighlightAllInputs() {
    this.getInputs().map(input => input.set({border: null}))
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