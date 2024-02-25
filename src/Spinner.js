import { Component } from './Component.js';

export class Spinner extends Component {
  constructor(
    width = 25,
    borderWidth = 3,
    primaryColor = '#000000',
    secondaryColor = '#ffffff',
    speed = 1,
  ) {
		super('div');
    this.style({
			border: `${borderWidth}px solid ${secondaryColor}`,
    	borderRadius: '50%',
    	borderTop: `${borderWidth}px solid ${primaryColor}`,
    	height: `${width}px`,
    	width: `${width}px`,
    	animation: `spin ${speed}s linear infinite`,
    	margin: 'auto',
  	});
	}
}
