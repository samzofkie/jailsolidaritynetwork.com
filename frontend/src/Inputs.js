import { Component } from '@samzofkie/component';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVBWXYZabcdefghijklmnopqrstuvwxyz',
  30,
);

export class Field extends Component {
  constructor({type, label, name, onclick, multiple, caption, id = nanoid(), inputFirst = false, inputOptions={}, labelOptions={}}, ...children) {
    let input = new Component('input', {
      type: type,
      id: id,
      name: name,
      onclick: onclick,
      multiple: multiple,
      ...inputOptions,
    });

    let _label = label ?
      new Component(
        'label',
        {
          for: id,
          onclick: event => {
            if (type === 'radio') {
              if (!input.root.checked)
                input.root.checked = true;
            } else if (type === 'checkbox')
              input.root.checked = !input.root.checked;
            if (onclick) onclick(event);
          },
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
}
