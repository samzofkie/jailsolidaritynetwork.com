import { Component } from '@samzofkie/component';
import { Spinner } from './Spinner.js';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVBWXYZabcdefghijklmnopqrstuvwxyz',
  30,
);

export class Field extends Component {
  constructor({
    type, 
    label, 
    name,
    caption,
    id = nanoid(), 
    inputFirst = false, 
    inputOptions={}, 
    labelOptions={}
  }, ...children) {
    let input = new Component('input', {
      type: type,
      id: id,
      name: name,
      ...inputOptions,
    });

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
        gap: '5px',
      },
      ...(inputFirst ? [input, _label] : [_label, input]),
      ...children,
    );

    this.input = input;
    this.label = _label;
  }
}

export class Section extends Component {
  constructor(title, ...children) {
    super('div',
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
      })
    super(title, spinner);
  }
}
