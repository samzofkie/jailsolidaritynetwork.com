import { Div } from './Root.js';

export class Spinner extends Div {
  constructor(
    width = 25,
    borderWidth = 3,
    primaryColor = '#000000',
    secondaryColor = '#ffffff',
    speed = 1,
  ) {
		super();
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
