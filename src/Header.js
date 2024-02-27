import { Component } from "./Component";

class Logo extends Component {
	constructor(width = '200px') {
		super('img');
    this.width = width;
		this.root.src = 'jsn-logo-transparent.png';
		this.root.alt = 'Jail Solidarity Network logo';
		
		this.style({width: width});
	}
}

class LinkButton extends Component {
  constructor(text, pathName) {
    super('a');
    this.style({
      'flexGrow': '1',
      
      'display': 'flex',
      'alignItems': 'center',
      'justifyContent': 'center',
      'text-align': 'center',
      
      'padding': '5px',
      'color': 'white',
      'backgroundColor': 'black',
      'border-radius': '15px',
      'textDecoration': 'none',
    })
    this.append(text);
    this.root.href = pathName;
  }
}

class NavBar extends Component {
  constructor(linkButtons) {
    super('div');
    this.style({
      'flexGrow': '2',
      'display': 'grid',
      'gridTemplateRows': '50% 50%',
    })
    
    let buttonContainer = new Component('div');
    buttonContainer.style({
      'gridRowStart': '2',
      'display': 'flex',
      'gap': '3px',
      'justifyContent': 'space-evenly',
      'background-color': '#505050',
      'border-radius': '15px',
      'padding': '4px',
    })

    this.append(buttonContainer);
    Object.entries(linkButtons).map(tuple => buttonContainer.append(new LinkButton(tuple[0], tuple[1])));
  }
}

class SideMenu extends Component {
  constructor(linkButtons, logo) {
    super('div');
    this.logo = logo;

    this.width = '80px';
    this.height = '80px';
    this.style({
      'width': this.width,
      'height': this.height,
      'transition': 'width 0.3s, height 0.3s',
      'box-sizing': 'border-box',
      'display': 'flex',
      'flexDirection': 'column',
      'gap': '3px',
      'fontSize': '25px',
    })
    
    this.createBars();
    this.createLinkButtons(linkButtons);

    this.expanded = false;
    this.root.onclick = () => {
      if (this.expanded)
        this.collapse();
      else
        this.expand();
    };
  }

  createBars() {
    this.bars = new Component('span');
    this.bars.root.className = 'material-symbols-outlined';
    this.bars.style({
      'fontSize': this.width, 
      'alignSelf': 'flex-end',
      'cursor': 'pointer',
    });
    this.bars.append('menu');
    this.append(this.bars);
  }

  createLinkButtons(linkButtons) {
    this.linkButtons = Object.entries(linkButtons).map(tuple => new LinkButton(tuple[0], tuple[1]));
    this.hideLinkButtons();
    this.linkButtons.map(button => this.append(button));
  }
  hideLinkButtons() {this.linkButtons.map(button => button.style({'visibility': 'hidden'}))}
  showLinkButtons() {this.linkButtons.map(button => button.style({'visibility': 'visible'}))}

  expand() {
    this.expanded = true;
    let bodyMargin = parseInt(window.getComputedStyle(document.body).margin);
    this.style({
      'width': `${document.body.offsetWidth}px`,
      'height': `${window.innerHeight - (bodyMargin * 2)}px`,
    });
    this.logo.root.style.width = '0px';
    this.bars.root.innerHTML = 'close';
    this.showLinkButtons();
  }

  collapse() {
    this.expanded = false;
    this.style({
      'width': this.width,
      'height': this.height,
    });
    this.bars.root.innerHTML = 'menu';
    this.hideLinkButtons();
    setTimeout(() => this.logo.root.style.width = this.logo.width, 200);
  }
}

export class Header extends Component {
  constructor(isMobile) {
    super('div');
    this.style({
      'border-bottom': '2px solid black',
      'display': 'flex',
      'flexFlow': 'row wrap',
      'justifyContent': 'space-between',
      'alignItems': isMobile? 'center' : null,
    })

    this.linkButtons = {
      'Archive': '/archive.html',
      'Sheriff Dart vs. Reality': '/dart.html',
      'Cook County Jail Timeline': '/timeline.html',
      'About': '/about.html',
      'Action': '/action.html',
    };
    
    this.logo = new Logo;
    this.append(this.logo);

    if (isMobile)
      this.append(new SideMenu(this.linkButtons, this.logo));
    else
      this.append(new NavBar(this.linkButtons));
  }
}