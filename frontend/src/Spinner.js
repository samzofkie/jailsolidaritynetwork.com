import { Component } from '@samzofkie/component';

export class Spinner extends Component {
  constructor({
    width = '25px',
    borderWidth = '3px',
    primaryColor = '#000000',
    secondaryColor = '#ffffff',
    speed = 1,
  } = {}) {
		// TODO: make sure we don't construct and insert a new CSSStyleSheet if
		// one with the '@keyframes' rule already exists!
		const ss = new CSSStyleSheet;
		ss.insertRule(`
			@keyframes spin { 
				0% { transform: rotate(0deg); } 
				100% { transform: rotate(360deg); } 
			}
		`);
		document.adoptedStyleSheets = [ss];

		super(
			'div',
			{
				border: `${borderWidth} solid ${secondaryColor}`,
				borderRadius: '50%',
				borderTop: `${borderWidth} solid ${primaryColor}`,
				height: width,
				width: width,
				animation: `spin ${speed}s linear infinite`,
			}
		);
	}
}