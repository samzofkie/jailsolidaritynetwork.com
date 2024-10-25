import { Component } from '@samzofkie/component';
import { TranscriptionEditor } from './TranscriptionEditor.js';
import { Field, Section, FetchedSection } from './Inputs.js';
import { Spinner } from './Spinner.js';
import { FileUpload } from './FileUpload.js';

export class UploadForm extends Component {
  constructor() {
    super('form', {
      display: 'flex',
      flexFlow: 'column wrap',
      gap: 10,
      alignItems: 'flex-start',
      enctype: 'multipart/form-data',
    });

    this.date = new Field({
      type: 'date',
      label: 'Date received: ',
      name: 'dateReceived',
      caption: '(day will be ignored)',
      inputOptions: {required: true},
    });

    this.divisions = new FetchedSection(
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

    this.gender = new Section(
      'Gender: ',
      ...['Male', 'Female', 'Non-binary', 'Other']
        .map((gender, i) =>
          new Field({
            type: 'radio',
            label: gender,
            name: 'gender',
            inputFirst: true,
            inputOptions: {
              required: true,
              value: gender,
              checked: i === 0 ? true : '',
            },
          })
        )
    );

    this.editor = new TranscriptionEditor;

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

    if (!localStorage.getItem('accessToken'))
      this.append(
        new Component(
          'span', 
          {color: 'red'}, 
          'You are not logged in! Any attempts to upload will be rejected. You can login ',
          new Component('a', {href: '/login.html'}, 'here'), 
          '.'
        )
      );

    this.fileUpload = new FileUpload;

    this.append(        
      this.date,
      this.divisions,
      this.lengthOfStay,
      this.gender,
      this.editor,
      new Component('div', {fontWeight: 'bold'}, 'Files:'),
      this.fileUpload,
      this.complaint,
      this.submit,
      this.spinner,
    );

    // Set dummy values for testing
    this.date.input.root.value = '2024-01-01';
    setTimeout(() => 
      this.divisions.children.map((c, i) => {
        if (i < 2)
          return;
        if (i < 5) {
          c.input.root.checked = true;
        }
      }),
      500
    );
    this.lengthOfStay.input.root.value = '12'
    this.editor.input.root.value = 'Sentence. Sentence.<LS,FW> This right here is another sentence bruv.<V,LS,FW> Idek what ur thinking bruv.<FW> Its a sure ting bruv. ';
  }

  getInputs() {
    return [
      this.date.input,
      ...this.divisions.getInputs(),
      this.lengthOfStay.input,
      ...this.gender.getInputs(),
      this.editor.input,
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

  consolidateDivisionsEntries(formData) {
    const divisions = [...formData.entries()]
      .filter(([field, _]) => field.slice(0, 'division'.length) === 'division')
      .map(([division, _]) => division.slice('division'.length));
    divisions.map(division => formData.delete('division' + division));
    formData.append('divisions', divisions);
  }

  buildPostFormData() {
    const formData = new FormData;
    formData.set('date', this.date.input.root.value);
    formData.set('divisions', this.divisions.children.slice(2)
      .filter(d => d.input.root.checked)
      .map(d => d.label.root.innerText));
    formData.set('lengthOfStay', this.lengthOfStay.input.root.value);
    formData.set('gender', this.gender.children.slice(1)
      .find(field => field.input.root.checked)
      .label.root.innerText,);
    formData.set('transcription', this.editor.input.root.value);
    return formData;
  }

  async upload(event) {
    event.preventDefault();
    this.unhighlightAllInputs();
    this.complaint.hide();

    if (!this.allInputsValid()) {
      this.complain('Please fill out the highlighted inputs!');
      this.highlightInvalidInputs();
      return;
    }

    const testimonyData = Object.fromEntries(this.buildPostFormData().entries())

    this.spinner.show();
    this.submit.hide();

    const res = await fetch(
      '/testimonies', 
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' +  localStorage.getItem('accessToken'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonyData),
      }
    );

    if (res.status !== 200) {
      if (res.status === 401)
        this.complain('Your upload attempt lacked an authorization token! That seems like a problem with the frontend.');
      else if (res.status === 403)
        this.complain('The authorization token your browser sent is invalid!');
      this.spinner.hide();
      this.submit.show();
      return;
    }

    const id = (await res.json()).id;

    for (const input of this.fileUpload.inputs) {
      const file = input.root.files[0];
      const fileFormData = new FormData;
      fileFormData.append('file', file);

      const fileRes = await fetch(
        `/testimonies/${id}/files`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' +  localStorage.getItem('accessToken'),
          },
          body: fileFormData,
        }
      );

      if (fileRes.status !== 200) {
        this.complain(await fileRes.text());
        this.spinner.hide();
        this.submit.show();
        break;
      }
    }
  }
}