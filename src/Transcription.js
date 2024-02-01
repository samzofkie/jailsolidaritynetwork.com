export default class Transcription {
	constructor(transcription) {
		this.transcription = transcription;
		this.expanded = false;
		this.height = 200;

		this.div = document.createElement('div');
		this.div.style.overflow = 'hidden';

		for (let line of this.transcription) {
			let [timestamp, text] = line.split('\n');
			let p = document.createElement('p');
			p.id = timestamp;
			p.append(text);
			p.style.margin = '0px';
			this.div.append(p);
		}
		this.div.onclick = () => this.toggle();

		this.more = document.createElement('p');
		this.more.style.color = 'blue';
		this.div.appendChild(this.more);

		this.collapse();
	}

	expand() {
		this.expanded = true;
		this.div.style.height = null;
	}

	collapse() {
		this.expanded = false;
		this.div.style.height = `${this.height}px`;
	}

	toggle() {
		this.expanded? this.collapse() : this.expand();
	}
}
