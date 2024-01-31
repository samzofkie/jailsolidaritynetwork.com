import Spinner from './Spinner.js';

export default class TestimonyCard {
	constructor(testimonyEntry) {
		this.name = testimonyEntry.name;
		this.type = testimonyEntry.type;
		// !!! ALWAYS USE .toUTC methods for this.date !!!
		this.date = new Date(testimonyEntry.date);
		this.spinner = new Spinner(25);
		
		this.createDiv();
		this.appendSpinner();
		
		this.fetchAndAppendTestimonyTranscription();

		document.body.appendChild(this.cardDiv);
	}

	async fetchAndAppendTestimonyTranscription() {
  	const response = await fetch(`/testimonies/${this.name}.txt`);
		this.transcription = await response.text();
		this.transcription = this.transcription.split('\n\n');
		this.removeSpinner();
	  this.createTranscriptionDiv();
		this.appendTranscriptionDiv();
	}

	createDiv() {
		let card = document.createElement('div');
		card.style.padding = '5px';
		card.style.margin = '5px';
		card.style.border = '2px solid black';
  	card.style.width = '400px';
		card.style.backgroundColor = '#dddddd';

		let title = document.createElement('p');
		title.append(this.name);
		card.appendChild(title);

		this.cardDiv = card;
	}

	appendSpinner() {
		this.cardDiv.appendChild(this.spinner.div);
	}

	removeSpinner() {
		this.spinner.div.remove();
	}

	createTranscriptionDiv() {
		this.transcriptionDiv = document.createElement('div');
		for (let line of this.transcription) {
			let [timestamp, text] = line.split('\n');
			let p = document.createElement('p');
			p.id = timestamp;
			p.append(text);
			p.style.margin = '0px';
			this.transcriptionDiv.append(p);
		}
	}

	appendTranscriptionDiv() {
		this.cardDiv.appendChild(this.transcriptionDiv);
	}
}
