import { Component, Store } from '@samzofkie/component';
import { TranscriptionEditor } from './TranscriptionEditor.js';
import { Field, Section, FetchedSection } from './Inputs.js';
import { Spinner } from './Spinner.js';
import { FileUpload } from './FileUpload.js';

export class UploadForm extends Component {
  constructor() {
    super(
      'form', 
      {
        //display: 'flex',
        //flexFlow: 'column wrap',
        //gap: 10,
        //alignItems: 'flex-start',
        enctype: 'multipart/form-data',
        lineHeight: 30,
      },
    );

    this.dateLabel = new Component(
      'label',
      {
        htmlFor: 'dateReceived'
      },
      'Date received: '
    );

    this.dateInput = new Component(
      'input',
      {
        type: 'date',
        id: 'dateReceived',
        name: 'dateReceived',
      }
    );

    this.append(
      this.dateLabel, 
      this.dateInput, 
      new Component('br'),
    );
    
    this.lengthOfStayLabel = new Component(
      'label',
      {
        htmlFor: 'lengthOfStay',
      },
      'Length of stay: '
    );

    this.lengthOfStayInput = new Component(
      'input',
      {
        type: 'text',
        id: 'lengthOfStay',
        name: 'lengthOfStay',
        width: 30,
      }
    );

    this.append(
      this.lengthOfStayLabel,
      this.lengthOfStayInput,
      ' months',
      new Component('br'),
    );

    this.genderLabel = new Component(
      'label',
      {
        htmlFor: 'gender'
      },
      'Gender: '
    );

    this.genderInput = new Component(
      'input',
      {
        type: 'text',
      }
    );

    this.append(
      this.genderLabel, 
      this.genderInput,
      new Component('br'),
    );

    this.divisionsContainer = new Component('div');

    this.append(
      'Divisions: ',
      this.divisionsContainer
    );

    fetch('/divisions')
      .then(async res => {
        const divisionObjects = (await res.json()).data.items;
        for (const divisionObject of divisionObjects) {
          this.divisionsContainer.append(
            new Component(
              'input', 
              {
                type: 'checkbox',
                id: divisionObject.id.toString(),
                name: divisionObject.name,
              }
            ),
            new Component(
              'label',
              {
                htmlFor: divisionObject.id.toString(),
              },
              divisionObject.name,
            )
          );
        }
      });

    this.transcriptionEditor = new TranscriptionEditor;

    this.append(this.transcriptionEditor);

    this.fileUploader = new FileUpload;

    this.append(
      'Files: ',
      this.fileUploader
    );

    this.complaintDiv = new Component(
      'div',
      {
        color: 'red',
      }
    );

    this.append(this.complaintDiv);

    this.submitButton = new Component(
      'input',
      {
        type: 'submit',
        value: 'Submit',
        onclick: event => this.submit(event),
      },
    );

    this.append(this.submitButton);

    /*this.date = new Field({
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

    if (!localStorage.getItem('authToken'))
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
    );*/

    // Set dummy values for testing
    //this.date.input.root.value = '2024-01-01';
    /*setTimeout(() => 
      this.divisions.children.map((c, i) => {
        if (i < 2)
          return;
        if (i < 5) {
          c.input.root.checked = true;
        }
      }),
      500
    );*/
    //this.lengthOfStay.input.root.value = '12'
    //this.editor.input.root.value = 'Sentence. Sentence.<LS,FW> This right here is another sentence bruv.<V,LS,FW> Idek what ur thinking bruv.<FW> Its a sure ting bruv. ';
  }

  buildTestimonyWriteObject() {
    const data = {};
    
    if (this.dateInput.root.value) {
      data.dateReceived = this.dateInput.root.value.slice(0, -3);
    }

    if (this.lengthOfStayInput.root.value) {
      const numMonths = parseInt(this.lengthOfStayInput.root.value);
      if (numMonths)
        data.lengthOfStay = numMonths;
    }

    if (this.genderInput.root.value) {
      data.gender = this.genderInput.root.value.trim();
    }

    const checkedDivisions = this.divisionsContainer.children
      .filter(child => child.root.tagName === 'INPUT')
      .filter(input => input.root.checked)
      .map(input => input.root.name);
    
    if (checkedDivisions.length)
      data.divisions = checkedDivisions;

    const sentences = Store.taggedText.ir
      .map(paragraph => paragraph.sentences)
      .flat()
      .map(sentence => ({
        text: sentence.text,
        categories: [...sentence.tags],
      }));

    if (sentences.length)
      data.transcription = sentences;
  
    return data;
  }

  async submit(event) {
    event.preventDefault();
    const testimonyWriteObject = this.buildTestimonyWriteObject();

    let res = await fetch(
      '/testimonies', 
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' +  localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: testimonyWriteObject
        }),
      }
    );
    let resBody = await res.json();

    if (res.status !== 200) {
      this.complaintDiv.append(
        new Component('span', resBody.error.message)
      );
      return;
    }

    const testimonyId = resBody.data.testimonyId;

    for (const input of this.fileUploader.inputs) {
      const file = input.root.files[0];

      res = await fetch(
        `/testimonies/${testimonyId}/files`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' +  localStorage.getItem('authToken'),
          },
          body: file,
        }
      );

      if (res.status !== 200) {
        this.complaintDiv.append(
          new Component('span', resBody.error.message)
        );        
        return;
      }
    }
  }

  /*getInputs() {
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

  formatDate(dateString) {
    const date = new Date(dateString);
    let month = (date.getMonth() + 1).toString();
    if (month.length < 2) {
      month = '0' + month;
    }
    return `${date.getFullYear()}-${month}`;
  }

  buildPostFormData() {
    const formData = new FormData;

    formData.set('dateReceived', formatDate(this.date.input.root.value));
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

    // TODO: parse transcription

    const testimonyData = {
      dateReceived: this.formatDate(this.date.input.root.value),
      lengthOfStay: this.lengthOfStay.input.root.value,
      gender: this.gender.children.slice(1)
        .find(field => field.input.root.checked)
        .label.root.innerText,
      divisions: this.divisions.children.slice(2)
        .filter(d => d.input.root.checked)
        .map(d => d.label.root.innerText),
    };

    const requestBody = {
      data: testimonyData,
    };

    this.spinner.show();
    this.submit.hide();

    const res = await fetch(
      '/testimonies', 
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' +  localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );
    const resJson = await res.json();

    if (res.status !== 200) {
      this.complain(resJson.error.message);
      this.spinner.hide();
      this.submit.show();
      return;
    }

    const testimonyId = resJson.data.testimonyId;

    for (const input of this.fileUpload.inputs) {
      const file = input.root.files[0];

      const fileRes = await fetch(
        `/testimonies/${testimonyId}/files`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' +  localStorage.getItem('authToken'),
          },
          body: file,
        }
      );

      console.log('here', fileRes);

      const fileResJson = await fileRes.json();

      if (fileRes.status !== 200) {
        this.complain(fileResJson.error.message);
        this.spinner.hide();
        this.submit.show();
        break;
      }
    }

    this.spinner.hide();
    this.submit.show();

  }*/
}