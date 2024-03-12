import { Component } from './Component.js';
import { LabeledInput } from './Inputs.js';

class TranscriptionInput extends LabeledInput {
  constructor() {
    super('Testimony transcription', '', 'textarea');
    this.input.style({
      width: '98%',
      height: '100px',
      margin: 'auto',
      marginBottom: '10px',
    });
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
        this.append(this.categorySelector);
      });
  }

  fetchCategories() {
    return fetch('/categories')
      .then(res => res.json());
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
  }

  toggleMode() {
    if (this.isInHighlightMode) {
      console.log(this.input);
      this.input.style({display: 'block'});
      this.highlighter.style({display: 'none'});
    } else {
      this.input.style({display: 'none'});
      this.highlighter.style({display: 'block'});
    }
    this.isInHighlightMode = !this.isInHighlightMode;
  }
}