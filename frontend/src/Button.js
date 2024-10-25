import { Component } from '@samzofkie/component';

export class Button extends Component {
  constructor(text) {
    super(
      'div',
      {
        borderRadius: 20,
        padding: 5,
        backgroundColor: 'black',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: 20,
        boxSizing: 'border-box',
      },
      new Component('div', {textAlign: 'center', userSelect: 'none'}, text),
    );
    this.textDiv = this.children[0];
    window.addEventListener('DOMContentLoaded', _ => this.adjustWidth(), false);
    this.set({
      onmouseover: _ => this.flipColors(),
      onmouseout: _ => this.flipColors(),
      onmousedown: _ => this.flipColors(),
      onmouseup: _ => this.flipColors(),
    });
  }

  flipColors() {
    this.set({
      backgroundColor: this.root.style.color,
      color: this.root.style.backgroundColor,
    });
  }

  adjustWidth() {
    this.textDiv.set({width: this.textDiv.root.offsetHeight});
  }
}