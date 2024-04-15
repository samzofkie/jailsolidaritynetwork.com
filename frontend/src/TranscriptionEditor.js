import { Component, Store } from '@samzofkie/component';
import { Label, RadioButtons } from './Inputs.js';
import { TaggedText, CSSHighlighter } from './TaggedText.js';

class TranscriptionInput extends Component {
  constructor() {
    super(
      'textarea',
      {
        width: '98%',
        height: '500px',
        margin: 'auto',

        // don't forget to remove!
        value: 'The Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V> With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages. In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.\n\nThe purpose of website security is to prevent these (or any) sorts of attacks. The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.\n\nThe Internet is a dangerous place!<BSM,CF,V>'
      },
    );
  }

  getTextareaValue() {
    return this.root.value;
  }
  
  setTextareaValue(text) {
    this.root.value = text;
  }
}

class CategorySelector extends RadioButtons {
  constructor() {
    super(
      Store.categories.map(category => category.name),
      'categorySelectorIgnoreThis',
      {lineBreaks: true}
    );

    // Set all Labels' backgroundColor and color
    this.pairs.map(pair => {
      const category = this.getCategoryByName(pair.label.root.innerText);
      pair.label.set({
        color: category.color,
        backgroundColor: category.backgroundColor,
      });
    });

    Store.currentCategory = this.getCategoryByName(this.pairs[0].label.root.innerText);
  }

  getCategoryByName(name) {
    return Store.categories.find(category => category.name === name);
  }

  handleClick(event) {
    super.handleClick(event);
    const categoryString = event.target.tagName === 'INPUT' ? event.target.id : event.target.innerText;
    Store.currentCategory = this.getCategoryByName(categoryString);

    if (!Store.highlightAll)
      Store.cssHighlighter.highlight();
  }
}

class HighlighterModeSelector extends RadioButtons {
  constructor() {
    super(['Highlight all categories at once', 'Highlight only selected category'], 'modeSelectorIgnoreThis', {lineBreaks: true});
  
    this.highlightAllPair = this.pairs[0];
    this.highlightSelectedPair = this.pairs[1];

    Store.highlightAll = true;
    this.highlightAllPair.input.root.checked = true;
  }

  handleClick(event) {
    super.handleClick(event);
    if (event.target.id === this.highlightAllPair.id 
        && Store.highlightAll === false) {
      Store.highlightAll = true;
      Store.cssHighlighter.highlight();
    } else if (event.target.id === this.highlightSelectedPair.id
               && Store.highlightAll === true) {
      Store.highlightAll = false;
      Store.cssHighlighter.highlight();
    }
  }
}

class HighlighterControls extends Component {
  constructor() {
    super(
      'div',
      {
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        marginBottom: '10px',
      },
      new CategorySelector,
      new Component(
        'div',
        new HighlighterModeSelector,
        new Component('hr'),
      )
    );
  }
}

class HighlighterTextDisplay extends Component {
  constructor() {
    super(
      'div',
      {
        textIndent: '35px',
        maxHeight: '450px',
        overflow: 'scroll',
      }
    );
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
    super(
      'div',
      {
        border: '3px solid gray',
        borderRadius: '20px',
        padding: '10px',
        backgroundColor: 'white',
        marginBottom: '10px',
      },
      new HighlighterControls,
      new Component(
        'button',
        {
          onclick: event => {
            event.preventDefault();
            Store.taggedText.addTag();
          }
        },
        'Tag'
      ),
      new Component('span', ' '),
      new Component(
        'button',
        {
          onclick: event => {
            event.preventDefault();
            Store.taggedText.removeTag();
          }
        },
        'Remove tag'
      ),
      new Component('hr'),
    );

    this.display = new HighlighterTextDisplay;
    this.append(
      this.display,
    );
  }
}

export class TranscriptionEditor extends Component {
  constructor() {
    super(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        alignItems: 'stretch',
      }
    );
    
    Store.isInHighlightMode = false;

    this.fetchCategories().then(categories => {
      Store.categories = this.assignColorsToCategories(categories);
      Store.taggedText = new TaggedText;
      Store.cssHighlighter = new CSSHighlighter;

      this.input = new TranscriptionInput;
      this.highlighter = new TranscriptionHighlighter;
      this.hideHighlighter();
      this.toggleButton = new Component(
        'button',
        {
          marginBottom: '10px',
          onclick: event => {
            event.preventDefault();
            this.toggleMode();
          },
        },
        'Add tags',
      );

      this.append(
        new Label('Testimony transcription', '', {bold: true}),
        this.input,
        this.highlighter,
        new Component('div', this.toggleButton), // div is just to prevent flex alignItems: 'stretch' from stretching this button out
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

  hideHighlighter() { this.highlighter.set({display: 'none'});}
  showHighlighter() { this.highlighter.set({display: 'block'});}
  hideInput() { this.input.set({display: 'none'});}
  showInput() { this.input.set({display: 'block'});}

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