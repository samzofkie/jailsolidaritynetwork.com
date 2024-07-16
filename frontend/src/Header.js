import { Component } from '@samzofkie/component';

class Logo extends Component {
  constructor(fullWidth = 200) {
    super(
      'img', 
      {
        width: fullWidth,
        src: 'jsn-logo-transparent.png',
        alt: 'Jail Solidarity Network logo',
    });
    this.fullWidth = fullWidth;
  }
}

class LinkButton extends Component {
  constructor(text, pathName) {
    super(
      'a',
      {
        flexGrow: '1',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',

        padding: 5,
        color: 'white',
        backgroundColor: 'black',
        borderRadius: 15,
        textDecoration: 'none',

        href: pathName,
      },
      text,
    );
  }
}

class NavBar extends Component {
  constructor(linkButtons) {
    super(
      'div',
      {
        flexGrow: '2',
        display: 'grid',
        gridTemplateRows: '50% 50%',
      },
      new Component(
        'div',
        {
          gridRowStart: '2',
          display: 'flex',
          gap: 3,
          justifyContent: 'space-evenly',
          backgroundColor: '#505050',
          borderRadius: 15,
          padding: 4,
        },
        ...linkButtons,
      ),
    );
  }
}

class SideMenu extends Component {
  constructor(linkButtons, logo) {
    const bars = new Component(
      'span',
      {
        className: 'material-symbols-outlined',
        fontSize: 80,
        alignSelf: 'flex-end',
        cursor: 'pointer',
      },
      'menu',
    );

    super(
      'div', 
      {
        width: 80,
        height: 80,
        transition: 'width 0.3s, height 0.3s',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        fontSize: 25,
      },
      bars,
      ...linkButtons,
    );

    this.logo = logo;
    this.bars = bars;
    this.linkButtons = linkButtons;

    this.hideLinkButtons();
    this.expanded = false;
    this.set({
      onclick: _ => {
        if (this.expanded) 
          this.collapse();
        else 
          this.expand();
      }
    });
  }

  hideLinkButtons() {
    this.linkButtons.map(button => button.set({ visibility: 'hidden' }));
  }

  showLinkButtons() {
    this.linkButtons.map(button => button.set({ visibility: 'visible' }));
  }

  expand() {
    this.expanded = true;
    let bodyMargin = parseInt(window.getComputedStyle(document.body).margin);
    this.set({
      width: document.body.offsetWidth,
      height: window.innerHeight - bodyMargin * 2,
    });
    this.logo.set({ width: 0 });
    this.bars.root.innerHTML = 'close';
    this.showLinkButtons();
  }

  collapse() {
    this.expanded = false;
    this.set({
      width: 80,
      height: 80,
    });
    this.bars.root.innerHTML = 'menu';
    this.hideLinkButtons();
    setTimeout(() => this.logo.set({ width: this.logo.fullWidth }), 200);
  }
}

export class Header extends Component {
  constructor() {
    const isMobile = window.innerWidth < 800;
    const linkButtons = Object.entries({
      Archive: '/archive.html',
      'Sheriff Dart vs. Reality': '/dart.html',
      'Cook County Jail Timeline': '/timeline.html',
      About: '/about.html',
      Action: '/action.html',
    }).map(pair => new LinkButton(...pair));
    const logo = new Logo;

    super(
      'div',
      {
        borderBottom: '2px solid black',
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'center' : null,
      },
      logo,
      isMobile ? 
        new SideMenu(linkButtons, logo) :
        new NavBar(linkButtons)
    );
  }
}
