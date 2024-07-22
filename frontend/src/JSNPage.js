import { Component, Page } from '@samzofkie/component';

export class JSNPage extends Page {
  constructor(title, ...children) {
    super(
      title,
      {
        backgroundColor: localStorage.getItem('accessToken') ? '#505050' : '#fff3d4',
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
          content: 'width=device-width, initial-scale=1',
        },
      ),
      new Component(
        'link',
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
        }
      ),
    );
  }
}