import { Component } from '@samzofkie/component';

class Logo extends Component {
	constructor(fullWidth = '200px') {
    super(
      'img',
      {
        width: fullWidth,
        src: 'jsn-logo-transparent.png',
        alt: 'Jail Solidarity Network logo',
      }
    );
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
        
        padding: '5px',
        color: 'white',
        backgroundColor: 'black',
        borderRadius: '15px',
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
          gap: '3px',
          justifyContent: 'space-evenly',
          backgroundColor: '#505050',
          borderRadius: '15px',
          padding: '4px',
        },
        ...Object.entries(linkButtons).map(([labelText, pathName]) => 
          new LinkButton(labelText, pathName)
        ),
      ),
    );
  }
}

class SideMenu extends Component {
  constructor(linkButtons, logo) {
    super(
      'div',
      {
        width: '80px',
        height: '80px',
        transition: 'width 0.3s, height 0.3s',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        fontSize: '25px',
      },
    );

    this.logo = logo;

    this.bars = new Component(
      'span',
      {
        className: 'material-symbols-outlined',
        fontSize: '80px', 
        alignSelf: 'flex-end',
        cursor: 'pointer',
      },
      'menu',
    );

    this.linkButtons = Object.entries(linkButtons).map(([labelText, pathName]) => 
      new LinkButton(labelText, pathName),
    );
    this.hideLinkButtons();

    this.expanded = false;
    
    this.append(
      this.bars,
      ...this.linkButtons,
    );
    
    this.root.onclick = () => {
      if (this.expanded)
        this.collapse();
      else
        this.expand();
    };
  }

  hideLinkButtons() {
    this.linkButtons.map(button => button.set({visibility: 'hidden'}));
  }

  showLinkButtons() {
    this.linkButtons.map(button => button.set({visibility: 'visible'}));
  }

  expand() {
    this.expanded = true;
    let bodyMargin = parseInt(window.getComputedStyle(document.body).margin);
    this.set({
      width: `${document.body.offsetWidth}px`,
      height: `${window.innerHeight - (bodyMargin * 2)}px`,
    });
    this.logo.set({width: '0px'});
    this.bars.root.innerHTML = 'close';
    this.showLinkButtons();
  }

  collapse() {
    this.expanded = false;
    this.set({
      width: '80px',
      height: '80px',
    });
    this.bars.root.innerHTML = 'menu';
    this.hideLinkButtons();
    setTimeout(() => this.logo.set({width: this.logo.fullWidth}), 200);
  }
}

export class Header extends Component {
  constructor(isMobile) {
    super(
      'div',
      {
        borderBottom: '2px solid black',
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'space-between',
        alignItems: isMobile? 'center' : null,
      },
    );

    this.isMobile = isMobile;

    this.logo = new Logo;

    this.linkButtons = {
      'Archive': '/archive.html',
      'Sheriff Dart vs. Reality': '/dart.html',
      'Cook County Jail Timeline': '/timeline.html',
      'About': '/about.html',
      'Action': '/action.html',
    };

    this.append(this.logo);

    if (this.isMobile)
      this.append(new SideMenu(this.linkButtons, this.logo));
    else
      this.append(new NavBar(this.linkButtons));
  }
}