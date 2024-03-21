import { Component, Store } from './Component.js';
import { LabeledInput } from './Inputs.js';
import { TaggedText, CSSHighlighter } from './TaggedText.js';

class TranscriptionInput extends LabeledInput {
  constructor() {
    super('Testimony transcription', '', 'textarea');
    this.input.style({
      width: '98%',
      height: '200px',
      margin: 'auto',
    });

    // TODO: remove this
    this.input.root.value = 'The Internet is a dangerous place! With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\n The purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.';
  }

  getTextareaValue() {
    return this.input.root.value;
  }
}

class CategorySelector extends Component {
  constructor() {
    super('form');
    this.style({marginBottom: '10px'});

    this.radioButtons = this.createRadioButtons();
    Store.currentCategory = this.getCategoryByName(this.radioButtons[0].label.root.innerText);
    this.radioButtons[0].input.root.checked = true;
  }

  getCategoryByName(name) {
    return Store.categories.find(category => category.name === name);
  }

  selectCategory(event) {
    event.preventDefault();
    const categoryString = event.target.tagName === 'INPUT'? event.target.id : event.target.innerText;
    Store.currentCategory = this.getCategoryByName(categoryString);
    
    let currentInput = this.radioButtons.find(pair => pair.label.root.innerText === categoryString).input;
    setTimeout(() => currentInput.root.checked = true, 0);

    Store.cssHighlighter.highlight();
  }

  createRadioButtons() {
    let radioButtons = [];
    for (let category of Store.categories) {
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

      radioButtons.push({'input': input, 'label': label});

      this.append(
        input, 
        label, 
        new Component('br')
      );
    }
    return radioButtons;
  }
}

class TranscriptionHighlighter extends Component {
  constructor() {
    super('div');
    this.style({
      border: '3px solid gray',
      borderRadius: '20px',
      padding: '10px',
      backgroundColor: 'white',
      marginBottom: '10px',
    });

    this.selector = new CategorySelector;
    this.button = this.createTagButton();
    this.display = this.createTextDisplay();

    this.append(
      this.selector,
      this.button,
      new Component('hr'),
      this.display,
    )
  }

  tag(event) {
    event.preventDefault();
    Store.taggedText.tag();
  }

  createTagButton() {
    let button = new Component('button', 'Tag');
    button.root.onclick = event => this.tag.call(this, event);
    return button;
  }

  createTextDisplay() {
    let display = new Component('div');
    display.style({textIndent: '35px'});
    display.root.className = 'ParagraphsDiv';
    return display;
  }

  clearTextDisplay() {
    Array.from(this.display.root.children).map(element => element.remove());
  }

  renderTextDisplay() {
    this.clearTextDisplay();
    Store.taggedText.getHTMLNodes().map(node => this.display.append(node))
  }
}

export class TranscriptionEditor extends Component {
  constructor() {
    super('div');
    
    Store.isInHighlightMode = false;

    this.fetchCategories().then(categories => {
      Store.categories = this.assignColorsToCategories(categories);
      Store.taggedText = new TaggedText;
      Store.cssHighlighter = new CSSHighlighter;

      this.input = new TranscriptionInput;
      this.highlighter = new TranscriptionHighlighter;
      this.hideHighlighter();
      this.toggleButton = this.createToggleButton();

      this.append(
        this.input,
        this.highlighter,
        this.toggleButton,
      );
    });
  }

  fetchCategories() {
    return fetch('/categories')
      .then(res => res.json());
  }

  assignColorsToCategories(categories) {
    let colors = [
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
    
    return categories.map((category, i) => ({
      ...category,
      ...colors[i],
    }));
  }

  hideHighlighter() { this.highlighter.style({display: 'none'});}
  showHighlighter() { this.highlighter.style({display: 'block'});}
  hideInput() { this.input.style({display: 'none'});}
  showInput() { this.input.style({display: 'block'});}

  createToggleButton() {
    let toggleButton = new Component('button', 'Add tags');
    toggleButton.style({marginBottom: '10px',});
    toggleButton.root.onclick = e => {
      e.preventDefault();
      this.toggleMode();
    };
    return toggleButton;
  }

  toggleMode() {
    if (Store.isInHighlightMode) {
      this.hideHighlighter();
      this.showInput();
      this.toggleButton.root.innerText = 'Add tags';

      // TODO: this.taggedText.getText()
    } else {
      this.hideInput();
      this.showHighlighter();
      this.toggleButton.root.innerText = 'Edit text';

      Store.taggedText.readInPlainText(this.input.getTextareaValue());
      this.highlighter.renderTextDisplay();
    }
    Store.isInHighlightMode = !Store.isInHighlightMode;
  }
}