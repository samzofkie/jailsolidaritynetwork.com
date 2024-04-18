import { Component } from '@samzofkie/component';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVBWXYZabcdefghijklmnopqrstuvwxyz',
  30,
);

export class Field extends Component {
  constructor({type, label, name, multiple, caption, required = '', id = nanoid(), inputFirst = false, inputOptions={}, labelOptions={}}, ...children) {
    let input = new Component('input', {
      type: type,
      id: id,
      name: name,
      multiple: multiple,
      required: required,
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
