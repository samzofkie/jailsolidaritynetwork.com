import { Component, Store } from '@samzofkie/component';

export class Spinner extends Component {
  constructor({
    width = '25px',
    borderWidth = '3px',
    primaryColor = '#000000',
    secondaryColor = '#ffffff',
    speed = 1,
  } = {}) {
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
