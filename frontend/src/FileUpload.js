import { Component } from "@samzofkie/component";
import { Button } from './Button';

export class FileUpload extends Component {
  constructor() {
    super(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        alignItems: 'flex-start',
      },
      new Component(
        'div', 
        {
          position: 'absolute',

          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }
      ),
      new Button('+'),
    );

    this.inputs = [];
    this.fileCardsDiv = this.children[0];
    this.addButton = this.children[1];
    this.addButton.set({
      onclick: () => {
        this.createNewFileInput();
      },
    });
  }

  // This gets called whenever things get added to or removed from 
  // this.fileCardsDiv. All it does is get rid of annoying(-ish) flex gap that
  // is rendered before this.addButton in the main div (since the gap will
  // show up even if this.fileCardsDiv is empty).
  hideOrShowFileCardsDiv() {
    if (this.inputs.length) {
      this.fileCardsDiv.set({position: 'relative'});
    } else {
      this.fileCardsDiv.set({position: 'absolute'});
    }
  }

  createNewFileInput() {
    const input = new Component(
      'input',
      {
        type: 'file', 
        name: 'file' + (this.inputs.length + 1), 
        id: 'file' + (this.inputs.length + 1),
        //enctype: 'multipart/form-data',
        display: 'none',
      }
    );
    this.inputs.push(input);
    this.append(input);
    input.root.click();

    // Create and insert new file card component
    input.root.addEventListener('change', () => {
      const xButton = new Button('×');
      xButton.set({padding: 0});

      const fileCard = new Component(
        'div',
        {
          backgroundColor: 'black',
          color: 'white',
          padding: 5,
          borderRadius: 20,

          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        input.root.files[0].name,
        xButton,
      );

      xButton.root.addEventListener('click', () => {
        // Remove input from this.inputs and DOM, and fileCard from DOM
        this.inputs = this.inputs.filter(i => i !== input);
        input.remove();
        fileCard.remove();

        this.hideOrShowFileCardsDiv();

        // Renumber this.inputs
        for (const i in this.inputs) {
          this.inputs[i].set({
            name: 'file' + (Number(i) + 1),
            id: 'file' + (Number(i) + 1),
          });
        }
      });

      this.hideOrShowFileCardsDiv();

      this.fileCardsDiv.append(fileCard);
      xButton.adjustWidth();
    });

  }
}