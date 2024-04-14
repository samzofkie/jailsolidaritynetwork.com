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
  constructor(type, name, id, {onclick = null}) {
    super(
      'input',
      {
        type: type,
        name: name,
        id: id,
        multiple: true,
        onclick: onclick,
      }
    );
  }
}

export class Label extends Component {
  constructor(text, id, {captionText = '', bold = false, onclick = null}) {
    super(
      'span',
      {
        onclick: onclick,
      },
      new Component(
        'label',
        {
          id: id,
          fontWeight: bold ? 'bold' : 'normal',
          display: captionText ? 'flex' : '',
          flexFlow: 'column wrap',
        },
        text,
      ),
      captionText ?
        new Component(
          'span',
          {
            fontSize: '12px',
          },
          captionText,
        ) :
        null
    );
  }
}

class LabelInputPair {
  constructor(type, name, labelText, {caption = '', bold = false, onclick = null}) {
    this.id = nanoid();
    this.input = new Input(type, name, this.id, {onclick: onclick});
    this.label = new Label(labelText, this.id, {captionText: caption, bold: bold, onclick: onclick});
  }
}

class LabeledInput extends Component {
  constructor(inputType, labelText, {caption='', bold=bold} = {}) {
    super(
      'div',
      {
        display: 'flex',
        gap: '10px',
      }
    );
    
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

/* Boxes entries parameter must be array of string label-texts. */
class Boxes extends Component {
  constructor(entries, options) {
    
    // Ensure all three options are set to at least something
    Object.entries({
      'type': 'checkbox',
      'label': '',
      'lineBreaks': true,
    }).map( ([property, defaultValue]) => {
      if (!options.hasOwnProperty(property)) {
        console.warn(`Boxes object initialized without option: ${property}. Defaulting to: ${defaultValue === '' ? '<empty string>' : defaultValue}`);
        options[property] = defaultValue;
      }
    });

    if (options.type === 'radio' && 
        !options.hasOwnProperty('name')) {
      throw new Error('Boxes object initialized with \'radio\' type but without .name property!');
    }

    super(
      'div',
      {
        display: 'flex',
        flexFlow: 'column wrap',
        gap: '2px',
        className: 'BoxesClassLabelDiv',
      },
      ...(options.label ? 
        [
          new Label(options.label, 'id', {bold: true}), 
          new Component('br')
        ] :
        []
      ),
    );

    this.type = options.type;

    // TODO: I think this can cleverly be reduced even more
    this.pairs = entries.map(entry => 
      /*let name = options.type === 'radio'? options.fieldName : toCamelCase(entry);
      const pair = new LabelInputPair(options.type, name, entry);
      pair.label.set({onclick: event => this.handleClick.call(this, event)});
      pair.input.set({onclick: event => this.handleClick.call(this, event)});
      return pair;*/
      new LabelInputPair(
        options.type,
        options.type === 'radio'? options.name : toCamelCase(entry),
        entry,
        {onclick: event => this.handleClick.call(this, event)}
      )
    );

    this.append(
      // This div is only to do flex direction
      new Component(
        'div',
        {
          display: 'flex',
          flexDirection: options.lineBreaks ? 'column' : 'row',
          gap: '10px',
        },
        ...this.pairs.map(({input, label}) => new Component(
          'div',
          input,
          label,
        )),
      )
    );

    if (this.type === 'radio') {
      this.pairs[0].input.set({checked: true});
    }
  }

  getInputNodeById(id) {
    return this.pairs.find(pair => pair.input.root.id === id).input.root
  }

  handleClick(event) {
    event.preventDefault();
    // We do it this way to that if the click event's target is the label,
    // we still get the <input> node.
    const relevantInput = this.getInputNodeById(event.target.id);

    // Never uncheck a checked radio button!
    if (this.type === 'radio' && !relevantInput.checked) {
      // Not completely sure why this can't be called directly...
      setTimeout(() => relevantInput.checked = !relevantInput.checked, 0);
    }
  }
}

export class RadioButtons extends Boxes {
  constructor(entries, name, {label = '', lineBreaks = false}) {
    super(entries, {
      type: 'radio',
      label: label,
      lineBreaks: lineBreaks,
      name: name,
    });
  }
}

export class Checkboxes extends Boxes {
  constructor(entries, {label = '', lineBreaks = false}) {
    super(entries, {
      type: 'checkbox',
      label: label,
      lineBreaks: lineBreaks,
    });
  }
}