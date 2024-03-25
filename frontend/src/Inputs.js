import { Component } from './Component.js';

export class LabeledInput extends Component {
  constructor(name, type, inputType = 'input') {
    super('div');
    this.style({
      paddingBottom: '5px',
    })
    let camelCase = name.split(' ').map(word => this.capitalizeFirstLetter(word)).join('');
    
    this.label = new Component('label');
    this.label.root.for = camelCase;
    this.label.root.innerText = name + ': ';

    this.input = new Component(inputType);
    if (inputType === 'input')
      this.input.root.type = type;
    this.input.root.id = camelCase;
    this.input.root.name = camelCase;

    this.append(this.label, this.input);
  }

  capitalizeFirstLetter(word) {
    let firstChar = word.charAt(0).toUpperCase();
    let remainder = word.slice(1);
    return firstChar + remainder;
  }
}

export class DateInput extends LabeledInput {
  constructor(name) {
    super(name, 'date');
  }
}

export class TextInput extends LabeledInput {
  constructor(name) {
    super(name, 'text');
  }
}

export class FileInput extends LabeledInput {
  constructor(name) {
    super(name, 'file');
  }
}

export class RadioButtons extends Component {
  constructor(labelNames = []) {
    super('form');
    this.pairs = this.createInputLabelPairs(labelNames);
    this.append(
      ...this.pairs.map((pair, i) => [pair.input, pair.label, new Component('br')]).flat()
    );
  }

  capitalizeFirstLetter(word) {
    let firstChar = word.charAt(0).toUpperCase();
    let remainder = word.slice(1);
    return firstChar + remainder;
  }

  toCamelCase(str) {
    return str.split(' ').map(word => this.capitalizeFirstLetter(word)).join('');
  }

  handler(event) {
    event.preventDefault();
  }

  createInputLabelPairs(labelNames) {
    return labelNames.map(labelName => {
      const id = this.toCamelCase(labelName); 

      let input = new Component('input');
      input.root.type = 'radio';
      input.root.id = id;
      input.root.name = this.root.className = this.constructor.name;
      input.root.onclick = event => this.handler.call(this, event);
      
      let label = new Component('label');
      label.root.for = id;
      label.root.id = id;
      label.root.onclick = event => this.handler.call(this, event);
      label.append(labelName);
      
      return {
        input: input,
        label: label,
      };
    });
  }
}