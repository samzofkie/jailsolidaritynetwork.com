import { Component } from './Component.js';
import { LabeledInput } from './Inputs.js';
import { TaggedText } from './TaggedText.js';

class TranscriptionInput extends LabeledInput {
  constructor() {
    super('Testimony transcription', '', 'textarea');
    this.input.style({
      width: '98%',
      height: '200px',
      margin: 'auto',
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

    this.style({marginBottom: '10px'});
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

      this.append(
        input, 
        label, 
        new Component('br')
      );
    }
  }
}

/* The TranscriptionHighlighter's responsibilities include creating a CategorySelector,
  a "tag" button for the user to click to tag some text, and a div containing all the
  text that can be highlighted and tagged.

*/
class TranscriptionHighlighter extends Component {
  constructor(categories) {
    super('div');

    this.categorySelector = new CategorySelector(categories);

    this.tagButton = new Component('button', 'Tag');
    this.tagButton.root.onclick = event => this.highlight.call(this, event);

    this.paragraphsDiv = new Component('div');
    this.paragraphsDiv.style({textIndent: '35px'});

    this.style({
      border: '3px solid gray',
      borderRadius: '20px',
      padding: '10px',
      backgroundColor: 'white',
      marginBottom: '10px',
    });

    this.append(
      this.categorySelector,
      this.tagButton,
      new Component('hr'),
      this.paragraphsDiv,
    )
  }

  highlight(event) {
    event.preventDefault();
    console.log(this);
    console.log(window.getSelection());
  }

  renderParagraphs(paragraphs) {
    Array.from(this.paragraphsDiv.root.children).map(element => element.remove());
    paragraphs.map(paragraph => this.paragraphsDiv.append(new Component('p', paragraph.join(''))));
  }
}

/* The TranscriptionEditor's main responsibilities are fetching the list of categories from the server,
   implementing the annotate toggle button to switch between the highlighter and the input, and holding
   the TaggedText object that serves as an Intermediate Representation between the text and it's 
   annotations.
*/
export class TranscriptionEditor extends Component {
  constructor() {
    super('div');

    this.isInHighlightMode = false;

    this.fetchCategories()
      .then(categories => {
        this.input = new TranscriptionInput;
        
        this.highlighter = new TranscriptionHighlighter(categories);
        this.highlighter.style({display: 'none'});

        this.createToggleButton();

        this.taggedText = new TaggedText(categories);

        this.append(
          this.input,
          this.highlighter,
          this.toggleButton,
        );

        // TODO: remove
        this.input.input.root.value = 'The Internet is a dangerous place! With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\n The purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.';
      });
  }

  fetchCategories() {
    return fetch('/categories')
      .then(res => res.json());
  }

  createToggleButton() {
    this.toggleButton = new Component('button', 'Add tags');
    this.toggleButton.style({marginBottom: '10px',});
    this.toggleButton.root.onclick = e => {
      e.preventDefault();
      this.toggleMode();
    };
  }

  hideHighlighter() { this.highlighter.style({display: 'none'});}
  showHighlighter() { this.highlighter.style({display: 'block'});}
  hideInput() { this.input.style({display: 'none'});}
  showInput() { this.input.style({display: 'block'});}

  toggleMode() {
    if (this.isInHighlightMode) {
      this.hideHighlighter();
      this.showInput();
      this.toggleButton.root.innerText = 'Add tags';
    } else {
      this.hideInput();
      this.showHighlighter();
      this.toggleButton.root.innerText = 'Edit text';

      //this.highlighter.setText(this.input.getTextareaValue());
      this.taggedText.setText(this.input.getTextareaValue());
      this.highlighter.renderParagraphs(this.taggedText.paragraphs);
    }
    this.isInHighlightMode = !this.isInHighlightMode;
  }
}