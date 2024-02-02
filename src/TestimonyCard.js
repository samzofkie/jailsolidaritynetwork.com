import Spinner from './Spinner.js';
import ExpandableTranscription from './ExpandableTranscription.js';

export default class TestimonyCard {
	constructor(testimonyEntry) {
		this.name = testimonyEntry.name;
		this.type = testimonyEntry.type;
		this.date = new Date(testimonyEntry.date);
		this.spinner = new Spinner(25);
		
		this.createDiv();
		this.createAudioPlayer();
		this.appendSpinner();
		
		this.fetchAndAppendTestimonyTranscription();

		document.body.appendChild(this.cardDiv);
		this.cardDiv.appendChild(this.audio);
	}

	async fetchAndAppendTestimonyTranscription() {
  	const response = await fetch(`/testimonies/${this.name}.txt`);
		let transcription = await response.text();
		transcription = transcription.split('\n\n');
		
		this.transcription = new ExpandableTranscription(transcription);
		this.removeSpinner();
		this.cardDiv.insertBefore(this.transcription.mainDiv, this.audio);
	}

	createDiv() {
		let card = document.createElement('div');
		card.style.padding = '5px';
		card.style.margin = '5px';
		card.style.border = '2px solid black';
  	card.style.width = '400px';
		card.style.backgroundColor = '#dddddd';

		let title = document.createElement('p');
		title.style.fontWeight = 'bold';
		title.append(`Recorded ${this.date.toLocaleString('default', {month: 'long'})}, ${this.date.getUTCFullYear()}`);
		card.appendChild(title);

		this.cardDiv = card;
	}

	createAudioPlayer() {
		this.audio = document.createElement('audio');
		this.audio.controls = true;
		this.audio.style.width = '100%';

		let audioSource = document.createElement('source');
		audioSource.src = `testimonies/${this.name}.mp3`;
		audioSource.type = 'audio/mpeg';
		this.audio.appendChild(audioSource);
	}

	appendSpinner() {
		this.cardDiv.appendChild(this.spinner.div);
	}

	removeSpinner() {
		this.spinner.div.remove();
	}
}
