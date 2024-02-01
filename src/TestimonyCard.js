import Spinner from './Spinner.js';
import Transcription from './Transcription.js';

export default class TestimonyCard {
	constructor(testimonyEntry) {
		this.name = testimonyEntry.name;
		this.type = testimonyEntry.type;
		this.date = new Date(testimonyEntry.date);
		this.spinner = new Spinner(25);
		
		this.createDiv();
		this.appendSpinner();
		
		this.fetchAndAppendTestimonyTranscription();

		document.body.appendChild(this.cardDiv);
	}

	async fetchAndAppendTestimonyTranscription() {
  	const response = await fetch(`/testimonies/${this.name}.txt`);
		let transcription = await response.text();
		transcription = transcription.split('\n\n');
		
		this.transcription = new Transcription(transcription);
		this.removeSpinner();
		this.cardDiv.appendChild(this.transcription.div);
	}

	createDiv() {
		let card = document.createElement('div');
		card.style.padding = '5px';
		card.style.margin = '5px';
		card.style.border = '2px solid black';
  	card.style.width = '400px';
		card.style.backgroundColor = '#dddddd';

		let title = document.createElement('p');
		title.append(`Recorded ${this.date.toLocaleString('default', {month: 'long'})}, ${this.date.getUTCFullYear()}`);
		card.appendChild(title);

		this.cardDiv = card;
	}

	appendSpinner() {
		this.cardDiv.appendChild(this.spinner.div);
	}

	removeSpinner() {
		this.spinner.div.remove();
	}
}
