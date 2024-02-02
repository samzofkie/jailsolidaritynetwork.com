export default class ExpandableTranscription {
	constructor(transcription) {
		this.transcription = transcription;
		this.expanded = false;
		this.height = 200;

		this.mainDiv = document.createElement('div');
		this.textDiv = document.createElement('div');
		this.mainDiv.appendChild(this.textDiv);

		this.textDiv.style.marginBottom = '5px';
		this.textDiv.style.transition = 'max-height 0.2s';
		this.textDiv.style.scrollBehavior = 'smooth';

		for (let line of this.transcription) {
			let [timestamp, text] = line.split('\n');
			let p = document.createElement('p');
			p.id = timestamp;
			p.append(text);
			p.style.margin = '0px';
			p.style.textIndent = '25px';
			this.textDiv.append(p);
		}

		this.moreButton = document.createElement('button');
		this.mainDiv.appendChild(this.moreButton);
		
		this.mainDiv.onclick = () => this.toggle();
		
		this.collapse();
	}

	expand() {
		this.expanded = true;
		this.textDiv.style.maxHeight = `${window.innerHeight - 200}px`;
		this.textDiv.style.overflow = 'scroll';
		this.moreButton.innerText = 'Show less text';
		window.scroll(0, this.mainDiv.offsetTop - 100);
	}

	collapse() {
		this.expanded = false;
		this.textDiv.style.maxHeight = `${this.height}px`;
		this.textDiv.style.overflow = 'hidden';
		this.textDiv.scroll(0, 0);
		this.moreButton.innerText = 'Show more text';
	}

	toggle() {
		this.expanded? this.collapse() : this.expand();
	}
}
