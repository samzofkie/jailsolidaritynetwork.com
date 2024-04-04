import { Component, Store } from './Component.js';
import { LabeledInput, RadioButtons } from './Inputs.js';
import { TaggedText, CSSHighlighter } from './TaggedText.js';

class TranscriptionInput extends LabeledInput {
  constructor() {
    super('Testimony transcription', '', 'textarea');
    this.input.style({
      width: '98%',
      height: '500px',
      margin: 'auto',
    });

    // TODO: remove this
    this.input.root.value = 'The Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.';
  }

  getTextareaValue() {
    return this.input.root.value;
  }
  
  setTextareaValue(text) {
    this.input.root.value = text;
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

    if (!Store.highlightAll)
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

class HighlighterModeSelector extends RadioButtons {
  constructor() {
    super(['Highlight all categories at once', 'Highlight only selected category']);
  
    this.highlightAllPair = this.pairs[0];
    this.highlightSelectedPair = this.pairs[1];

    Store.highlightAll = true;
    this.highlightAllPair.input.root.checked = true;
  }

  handler(event) {
    event.preventDefault();
    if (event.target.id === 'HighlightAllCategoriesAtOnce' 
        && Store.highlightAll === false) {
      this.highlightAllPair.input.root.checked = true;
      Store.highlightAll = true;
      Store.cssHighlighter.highlight();
    } else if (event.target.id === 'HighlightOnlySelectedCategory' 
               && Store.highlightAll === true) {
      this.highlightSelectedPair.input.root.checked = true;
      Store.highlightAll = false;
      Store.cssHighlighter.highlight();
    }
  }
}

class HighlighterControls extends Component {
  constructor() {
    super('div');
    this.style({
      display: 'grid',
      gridTemplateColumns: '50% 50%',
    });

    this.append(
      new CategorySelector,
      new Component('div', 
        new HighlighterModeSelector,
        new Component('hr'),
      ),
    )
  }
}

class HighlighterTextDisplay extends Component {
  constructor() {
    super('div');
    this.style({
      textIndent: '35px',
      maxHeight: '450px',
      overflow: 'scroll',
    });
    this.root.className = 'HighlighterTextDisplay';
  }
  
  clear() {
    Array.from(this.root.children).map(element => element.remove());
  }

  render() {
    this.clear();
    Store.taggedText.getHTMLNodes().map(node => this.append(node))
  }

  getSentenceNodes() {
    return [...this.root.children].map(paragraphNode => [...paragraphNode.children]).flat();
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

    this.display = new HighlighterTextDisplay;

    this.append(
      new HighlighterControls,
      this.createTagButton(),
      new Component('span', ' '),
      this.createRemoveButton(),
      new Component('hr'),
      this.display,
    )
  }

  tag(event) {
    event.preventDefault();
    Store.taggedText.addTag();
  }

  removeTag(event) {
    event.preventDefault();
    Store.taggedText.removeTag();
  }

  createButton(text, callback) {
    let button = new Component('button', text);
    button.root.onclick = event => callback.call(this, event)
    return button;
  }

  createTagButton() {return this.createButton('Tag', this.tag)}
  createRemoveButton() {return this.createButton('Remove tag', this.removeTag)}
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

      this.input.setTextareaValue(Store.taggedText.getPlainText());
    } else {
      this.hideInput();
      this.showHighlighter();
      this.toggleButton.root.innerText = 'Edit text';

      Store.taggedText.readInPlainText(this.input.getTextareaValue());
      this.highlighter.display.render();
      Store.cssHighlighter.highlight();
    }
    Store.isInHighlightMode = !Store.isInHighlightMode;
  }
}