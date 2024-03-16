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
    this.currentCategory = this.inputs[0].label.root.innerText;
    this.inputs[0].input.root.checked = true;

    this.style({marginBottom: '10px'});
  }

  selectCategory(event) {
    event.preventDefault();
    const categoryString = event.target.tagName === 'INPUT'? event.target.id : event.target.innerText;
    this.currentCategory = this.inputs.find(pair => pair.label.root.innerText === categoryString);
    setTimeout(() => this.currentCategory.input.root.checked = true, 0);
  }

  createCategoryRadioButtons() {
    this.inputs = [];
    for (let category of this.categories) {
      const handler = event => this.selectCategory.call(this, event);

      let input = new Component('input');
      input.root.type = 'radio';
      input.root.id = category.name;
      input.root.name = 'category';
      input.root.onclick = handler;
      input.style({marginBottom: '5px'});

      let label = new Component('label');
      label.root.for = category.name;
      label.append(category.name);
      label.root.onclick = handler;
      label.style({
        color: category.color,
        backgroundColor: category.backgroundColor,
      });

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
    this.tagButton.root.onclick = event => this.tag.call(this, event);

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

  clearParagraphsDiv() {
    Array.from(this.paragraphsDiv.root.children).map(element => element.remove());
  }

  appendParagraphs(paragraphNodes) {
    paragraphNodes.map(node => this.paragraphsDiv.append(node));
  }

  refreshParagraphs(paragraphNodes) {
    this.clearParagraphsDiv();
    this.appendParagraphs(paragraphNodes);
  }

  setTaggedText(taggedText) {
    this.taggedText = taggedText;
  }

  tag(event) {
    event.preventDefault();
    if (this.categorySelector.currentCategory)
      this.taggedText.tag(this.categorySelector.currentCategory);
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
        this.categories = categories;
        this.assignColorsToCategories();

        this.input = new TranscriptionInput;
        
        this.highlighter = new TranscriptionHighlighter(this.categories);
        this.hideHighlighter();

        this.createToggleButton();

        this.taggedText = new TaggedText(this.categories, this.highlighter);
        this.highlighter.setTaggedText(this.taggedText);

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

  assignColorsToCategories() {
    this.colors = [
      ['#800000', 'white'],
      ['#e6194B', 'white'],
      ['#f58231', 'white'],
      ['#ffe119', 'black'],
      ['#bfef45', 'black'],
      ['#3cb44b', 'white'],
      ['#42d4f4', 'black'],
      ['#4363d8', 'white'],
      ['#911eb4', 'white'],
      ['#f032e6', 'white'],
      ['#a9a9a9', 'white'],
      ['#9A6324', 'white'],
      ['#fabed4', 'black'],
    ].map(pair => ({backgroundColor: pair[0], color: pair[1]}));
    
    this.categories = this.categories.map((category, i) => ({
      ...category,
      ...this.colors[i],
    }));
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

      // this.taggedText.getText()
    } else {
      this.hideInput();
      this.showHighlighter();
      this.toggleButton.root.innerText = 'Edit text';

      this.taggedText.readInPlainText(this.input.getTextareaValue());
      this.highlighter.refreshParagraphs(this.taggedText.getHTMLNodes());
    }
    this.isInHighlightMode = !this.isInHighlightMode;
  }
}