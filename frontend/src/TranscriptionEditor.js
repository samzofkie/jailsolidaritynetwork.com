import { Component } from './Component.js';
import { LabeledInput } from './Inputs.js';

class TranscriptionInput extends LabeledInput {
  constructor() {
    super('Testimony transcription', '', 'textarea');
    this.input.style({
      width: '98%',
      height: '200px',
      margin: 'auto',
      marginBottom: '10px',
    });
  }

  getTextareaValue() {
    return this.input.root.value;
  }
}

class CategorySelector extends Component {
  constructor(categories) {
    super('form');
    this.categories = categories;
    this.currentCategory = null;
    this.createCategoryRadioButtons();
  }

  selectCategory(event) {
    event.preventDefault();
    const categoryString = event.target.tagName === 'INPUT'? event.target.id : event.target.innerText;
    this.currentCategory = this.inputs.find(pair => pair.label.root.innerText === categoryString);
    this.currentCategory.input.root.checked = true;
  }

  createCategoryRadioButtons() {
    this.inputs = [];
    for (let category of this.categories) {
      const handler = event => this.selectCategory.call(this, event);

      let input = new Component('input');
      input.root.type = 'radio';
      input.root.id = category;
      input.root.name = 'category';
      input.root.onclick = handler;

      let label = new Component('label');
      label.root.for = category;
      label.append(category);
      label.root.onclick = handler;

      this.inputs.push({'input': input, 'label': label});

      this.append(input, label, new Component('br'));
    }
  }
}

class TranscriptionHighlighter extends Component {
  constructor() {
    super('div');

    this.paragraphs = [];
    this.paragraphsDiv = new Component('div');
    this.paragraphsDiv.style({textIndent: '35px'});

    this.style({
      border: '3px solid gray',
      borderRadius: '20px',
      padding: '10px',
      backgroundColor: 'white',
      marginBottom: '10px',
    });

    this.fetchCategories()
      .then(categories => {
        this.categories = categories;
        this.categorySelector = new CategorySelector(this.categories);
        this.append(
          this.categorySelector,
          new Component('hr'),
          this.paragraphsDiv,
        );
      });
  }

  fetchCategories() {
    return fetch('/categories')
      .then(res => res.json());
  }

  clearParagraphs() {
    this.paragraphs = [];
    Array.from(this.paragraphsDiv.root.children).map(element => element.remove());
  }

  // TODO: unit test and input validation
  splitIntoSentences(paragraph) {
    let sentencesAndPunctuation = paragraph.split(/([.!?])/).filter(text => text !== '');
    let sentences = [];
    for (let i=0; i<sentencesAndPunctuation.length; i += 2) {
      sentences.push(sentencesAndPunctuation[i] + sentencesAndPunctuation[i+1])
    }
    return sentences;
  }

  renderParagraphs() {
    this.paragraphs.map(paragraph => this.paragraphsDiv.append(new Component('p', paragraph.join(''))));
  }

  setText(text) {
    this.clearParagraphs();
    this.paragraphs = text.split('\n\n').map(paragraph => this.splitIntoSentences(paragraph));
    this.renderParagraphs();
  }

}

export class TranscriptionEditor extends Component {
  constructor() {
    super('div');

    this.isInHighlightMode = false;

    this.annotateButton = new Component('button', 'Annotate transcription');
    this.annotateButton.style({marginBottom: '10px',});
    this.annotateButton.root.onclick = e => {
      e.preventDefault();
      this.toggleMode();
    };

    this.input = new TranscriptionInput;
    this.highlighter = new TranscriptionHighlighter;
    this.highlighter.style({display: 'none'});

    this.append(
      this.input,
      this.highlighter,
      this.annotateButton,
    );

    // TODO: remove
    this.input.input.root.value = 'The Internet is a dangerous place! With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\n The purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.';
  }

  toggleMode() {
    if (this.isInHighlightMode) {
      this.input.style({display: 'block'});
      this.highlighter.style({display: 'none'});
    } else {
      this.input.style({display: 'none'});
      this.highlighter.style({display: 'block'});
      this.highlighter.setText(this.input.getTextareaValue());
    }
    this.isInHighlightMode = !this.isInHighlightMode;
  }
}