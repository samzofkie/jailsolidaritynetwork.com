import { Component, Page, Store } from '@samzofkie/component';

export class JSNPage extends Page {
  constructor(...children) {
    super(
      {
        backgroundColor: '#fff3d4',
        fontFamily: 'Arial, Helvetica, sans-serif',
        boxSizing: 'border-box',
      },
      ...children,
    );

    this.head.append(
      new Component(
        'meta',
        {
          name: 'viewport',
          content: 'width-device-width, initial=scale=1',
        },
      )
    );
  }
}