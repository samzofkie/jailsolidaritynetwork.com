import { Component, Store } from '@samzofkie/component';
import { TranscriptionEditor } from './TranscriptionEditor.js';
import { Field, Section, FetchedSection } from './Inputs.js';
import { Spinner } from './Spinner.js';
import { FileUpload } from './FileUpload.js';

class MessageDiv extends Component {
  constructor() {
    super('div');
  }

  clear() {
    if (this.children.length) {
      this.children[0].remove();
    }
  }

  message(color, message) {
    this.append(new Component('span', {color: color}, message));
  }

  red(message) {
    this.clear();
    this.message('red', message);
  }

  green(message) {
    this.clear();
    this.message('LawnGreen', message);
  }
}

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

    this.messageDiv = new MessageDiv;
    this.append(this.messageDiv);

    this.submitButton = new Component(
      'input',
      {
        type: 'submit',
        value: 'Submit',
        onclick: event => this.submit(event),
      },
    );

    this.append(this.submitButton);
  }

  verifyInputs() {
    if (this.lengthOfStayInput.root.value) {
      console.log(this.lengthOfStayInput.root.value);
      console.log(this.lengthOfStayInput.root);
    }
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

    this.verifyInputs();

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
      this.messageDiv.red(resBody.error.message);
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
      resBody = res.json();

      if (res.status !== 200) {
        this.messageDiv(resBody.error.message)      
        return;
      }
    }

    this.messageDiv.green('Successfully uploaded!')


  }
}