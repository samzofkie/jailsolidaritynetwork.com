import { Component, Store } from '@samzofkie/component';
import { Spinner } from './Spinner.js';
import { Field } from './Inputs.js';
import { TaggedText, CSSHighlighter } from './TaggedText.js';

class TranscriptionInput extends Component {
  constructor() {
    super(
      'textarea',
      {
        width: '98%',
        height: 750,
        name: 'transcriptionText',
        id: 'testimonyEditor',
        required: true,
      }
    );
  }
}

class CategorySelector extends Component {
  constructor() {
    super(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      },
      ...Store.categories
        .map(category => new Field({
          type: 'radio',
          label: category.name,
          name: 'selectedCategory',
          inputFirst: true,
          inputOptions: {
            onclick: _ => {
              Store.currentCategory = category;
              if (!Store.highlightAll) 
                Store.cssHighlighter.highlight()
            },
          },
          labelOptions: {
            color: category.color,
            backgroundColor: category.backgroundColor,
          },
        }))
    );

    Store.currentCategory = Store.categories[0];
    this.children[0].input.root.checked = true;
  }
}

class HighlighterModeSelector extends Component {
  constructor() {
    super(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      },
      ...[
        'Highlight all categories at once', 
        'Highlight only selected category'
      ].map(label => new Field({
        type: 'radio',
        label: label,
        name: 'selectedCategoryMode',
        inputFirst: true,
        inputOptions: {
          onclick: _ => {
            if (label === 'Highlight all categories at once' &&
                Store.highlightAll === false) {
              Store.highlightAll = true;
              Store.cssHighlighter.highlight();
            } else if (
              label === 'Highlight only selected category' &&
              Store.highlightAll === true
            ) {
              Store.highlightAll = false;
              Store.cssHighlighter.highlight();
            }
          },
        },
      })),
    );

    Store.highlightAll = true;
    this.children[0].input.root.checked = true;
  }
}

class HighlighterTextDisplay extends Component {
  constructor() {
    super(
      'div', 
      {
        textIndent: 35,
        maxHeight: 450,
        overflow: 'scroll',
        className: 'HighlighterTextDisplay',
      }
    );
  }

  clear() {
    Array.from(this.root.children).map((element) => element.remove());
  }

  render() {
    this.clear();
    Store.taggedText.getHTMLNodes().map((node) => this.append(node));
  }

  getSentenceNodes() {
    return [...this.root.children]
      .map((paragraphNode) => [...paragraphNode.children])
      .flat();
  }
}

class TranscriptionHighlighter extends Component {
  constructor() {
    const display = new HighlighterTextDisplay;
    super(
      'div',
      {
        boxSizing: 'border-box',
        border: '3px solid gray',
        borderRadius: 20,
        padding: 10,
        backgroundColor: 'white',
        width: '100%',
      },
      new Component(
        'div',
        {
          display: 'grid',
          gridTemplateColumns: '50% 50%',
          marginBottom: 10,
        },
        new CategorySelector,
        new Component('div', new HighlighterModeSelector, new Component('hr')),
      ),
      new Component('div', {display: 'flex', gap: 10},
        new Component(
          'button',
          {
            onclick: event => {
              event.preventDefault();
              Store.taggedText.addTag();
            },
          },
          'Tag',
        ),
        new Component(
          'button',
          {
            onclick: event => {
              event.preventDefault();
              Store.taggedText.removeTag();
            },
          },
          'Remove tag',
        ),
      ),
      new Component('hr'),
      display,
    );
    this.display = display;
  }
}

export class TranscriptionEditor extends Component {
  constructor() {
    super(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box',
      },
      new Component(
        'label', 
        {
          fontWeight: 'bold', 
          htmlFor: 'testimonyEditor'
        }, 
        'Testimony transcription: '),
    );

    this.input = new TranscriptionInput;
    this.categoriesSpinner = new Spinner;
    this.append(
      this.input,
      this.categoriesSpinner,
    );

    fetch('/categories')
      .then(res => res.json())
      .then(this.assignColorsToCategories)
      .then(categories => {
        Store.categories = categories;
        Store.taggedText = new TaggedText;
        Store.cssHighlighter = new CSSHighlighter;

        this.highlighter = new TranscriptionHighlighter;
        this.hideHighlighter();
        
        this.toggleButton = new Component(
          'button',
          {
            marginBottom: 10,
            onclick: (event) => {
              event.preventDefault();
              this.toggleMode();
            },
          },
          'Add tags',
        );

        this.categoriesSpinner.remove();
        this.append(
          this.highlighter,
          this.toggleButton,
        )
      });
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
    ].map((pair) => ({ backgroundColor: pair[0], color: pair[1] }));

    return categories.map((category, i) => ({
      ...category,
      ...colors[i],
    }));
  }

  hideHighlighter() {this.highlighter.set({display: 'none'});}

  showHighlighter() {this.highlighter.set({display: 'block'});}

  hideInput() {this.input.set({display: 'none'});}

  showInput() {this.input.set({display: 'block'});}

  toggleMode() {
    if (Store.isInHighlightMode) {
      this.hideHighlighter();
      this.showInput();
      this.toggleButton.root.innerText = 'Add tags';

      this.input.root.value  = Store.taggedText.getPlainText();
    } else {
      this.hideInput();
      this.showHighlighter();
      this.toggleButton.root.innerText = 'Edit text';

      Store.taggedText.readInPlainText(this.input.root.value);
      this.highlighter.display.render();
      Store.cssHighlighter.highlight();
    }
    Store.isInHighlightMode = !Store.isInHighlightMode;
  }
}
