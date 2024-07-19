import { Component } from '@samzofkie/component';
import { Spinner } from './Spinner.js';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVBWXYZabcdefghijklmnopqrstuvwxyz',
  30,
);

// Field constructs a flexbox div with at least two children; an input 
// Component and a label Component. Depending on the presence or absence
// of a `label` property in the options parameter, it may rearrange the label
// Component into another flexbox div with a caption div underneath it. 
//
// The important properties of the controlling object parameter are:
//   - `type`: the .type property for the input Component
//   - `label`: text to display in the label Component
//   - `name`: a .name property for the input
//   - `caption` (optional):  text to display underneath the label
//   - `inputFirst` (optional): bool to specify the order in which to unpack
//       the input and label into the containing flexbox div
//   - `inputOptions` and `labelOptions` (optional): objects specifying
//       properties to be applied to the input and label Components, 
//       respectively.

export class Field extends Component {
  constructor({
    type, 
    label, 
    name,
    caption = '',
    inputFirst = false, 
    inputOptions={}, 
    labelOptions={},
    divOptions={},
  }, ...children) {
    const id = nanoid();
    let input = new Component(
      'input', 
      {
        type: type,
        id: id,
        name: name,
        ...inputOptions,
      }
    );

    let _label = label ?
      new Component(
        'label',
        {
          htmlFor: id,
          fontWeight: caption ? 'bold' : null,
          ...labelOptions,
        },
        label
      ) : null;

    
    if (caption)
      _label = new Component(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
        },
        _label,
        new Component('div', { fontSize: '12px' }, caption),
      )
    
    super(
      'div', 
      {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        ...divOptions,
      },
      ...(inputFirst ? [input, _label] : [_label, input]),
      ...children,
    );

    this.input = input;
    this.label = _label;
    this.id = id;
  }
}

export class Section extends Component {
  constructor(title, ...children) {
    super(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
      },
      new Component('span', {fontWeight: 'bold'}, title),
      ...children,
    );
  }

  getInputs() {
    return this.children
      .filter(comp => comp instanceof Field)
        .map(field => field.input);
  }
}

export class FetchedSection extends Section {
  constructor(title, endpoint, itemToField) {
    let spinner = new Spinner;
    fetch(endpoint)
      .then(res => res.json())
      .then(items => {
        spinner.remove();
        this.append(
          ...items.map(itemToField)
        );
      });
    super(title, spinner);
  }
}
