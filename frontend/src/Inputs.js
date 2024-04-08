import { Component } from '@samzofkie/component';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVBWXYZabcdefghijklmnopqrstuvwxyz', 30);


function capitalizeFirstLetter(word) {
  let firstChar = word.charAt(0).toUpperCase();
  let remainder = word.slice(1);
  return firstChar + remainder;
}

function lowerCaseFirstLetter(word) {
  let firstChar = word.charAt(0).toLowerCase();
  let remainder = word.slice(1);
  return firstChar + remainder;
}

function toCamelCase(str) {
  return str.split(' ')
    .map((word, i) => i === 0? lowerCaseFirstLetter(word) : capitalizeFirstLetter(word))
    .join('')
}

class Input extends Component {
  constructor(type, name, id) {
    super('input');
    this.root.type = type;
    this.root.name = name; // This is the query string parameter
    this.root.id = id;
    this.root.multiple = true;
  }
}

export class Label extends Component {
  constructor(text, id, {captionText = '', bold = false} = {}) {
    super('span');
    if (captionText) {
      this.style({
        display: 'flex',
        flexFlow: 'column wrap',
      });
    };

    let label = new Component('label');
    label.root.id = id;
    label.root.innerText = text;
    label.style({
      fontWeight: bold? 'bold' : 'normal',
    });
    this.append(label);

    if (captionText) {
      let caption = new Component('span');
      caption.style({fontSize: '12px'});
      caption.root.innerText = captionText;
      this.append(caption);
    }
  }
}

class LabelInputPair {
  constructor(type, name, labelText, {caption = '', bold = false} ={}) {
    this.id = nanoid();
    this.input = new Input(type, name, this.id);
    this.label = new Label(labelText, this.id, {captionText: caption, bold: bold});
  }
}

class LabeledInput extends Component {
  constructor(inputType, labelText, {caption='', bold=bold} = {}) {
    super('div');
    this.style({
      display: 'flex',
      gap: '10px',
    });
    this.pair = new LabelInputPair(inputType, toCamelCase(labelText), labelText, {caption: caption, bold: bold});
    this.append(
      this.pair.label,
      this.pair.input,
    );
  }
}

export class DateInput extends LabeledInput {
  constructor(labelText, caption='') {
    super('date', labelText, {caption: caption, bold: true});
  }
}

export class TextInput extends LabeledInput {
  constructor(labelText, caption='') {
    super('text', labelText, {caption: caption, bold: true});
  }
}

export class FileInput extends LabeledInput {
  constructor(labelText, caption='') {
    super('file', labelText, {caption: caption, bold: true});
  }
}

class Boxes extends Component {
  constructor(entries, options) {
    super('div');
    
    this.style({
      display: 'flex',
      flexFlow: 'column wrap',
      gap: '2px',
    });

    Object.entries({
      'type': 'checkbox',
      'label': '',
      'lineBreaks': true,
    }).map( ([property, defaultValue]) => {
      if (!options.hasOwnProperty(property)) {
        console.warn(`Boxes object initialized without option: ${property}. Defaulting to: ${defaultValue === ''? '<empty string>' : defaultValue}`);
        options[property] = defaultValue;
      }
    });

    if (options.type === 'radio' && 
        !options.hasOwnProperty('name')) {
      throw new Error('Boxes object initialized with \'radio\' type but without .name property!');
    }

    this.type = options.type;
    this.label = options.label;
    this.lineBreaks = options.lineBreaks;

    this.pairs = entries.map(entry => {
      let name = this.type === 'radio'? options.fieldName : toCamelCase(entry);
      const pair = new LabelInputPair(this.type, name, entry);
      pair.label.root.onclick = event => this.handleClick.call(this, event);
      pair.input.root.onclick = event => this.handleClick.call(this, event); 
      return pair;
    });

    if (this.label) {
      this.append(
        new Label(this.label, 'id', {bold: true}),
        //this.label,
        new Component('br'),
      )
    } 

    let container = new Component('div');
    container.style({
      display: 'flex',
      flexDirection: this.lineBreaks? 'column' : 'row',
      gap: '10px',
    });
    container.append(...this.pairs.map(({input, label}) => new Component('div', input, label)));
    this.append(container);
  }

  getInputNodeById(id) {
    return this.pairs.find(pair => pair.input.root.id === id).input.root
  }

  handleClick(event) {
    event.preventDefault();
    // We do it this way to that if the click event's target is the label,
    // we still get the <input> node.
    const relevantInput = this.getInputNodeById(event.target.id);
    // Not completely sure why this can't be called directly...
    setTimeout(() => relevantInput.checked = !relevantInput.checked, 0);
  }

  getPairsInDivs() {
    return this.pairs.map(pair => new Component('div', pair.input, pair.label));
  }
}

export class RadioButtons extends Boxes {
  constructor(entries, name, {label = '', lineBreaks = false} = {}) {
    super(entries, {
      type: 'radio',
      label: label,
      lineBreaks: lineBreaks,
      name: name,
    });
  }
}

export class Checkboxes extends Boxes {
  constructor(entries, {label = '', lineBreaks = false} = {}) {
    super(entries, {
      type: 'checkbox',
      label: label,
      lineBreaks: lineBreaks,
    });
  }
}