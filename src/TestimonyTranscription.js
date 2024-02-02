import Spinner from './Spinner.js';

/* TestimonyTranscription
	   - creates a div,
		 - initiates the fetch of the transcription text, and
		 - creates and renders a spinner
	 Then, when the network request finishes, it
	 	 - initializes the transcription member,
		 - removes the spinner,
		 - creates a div to contain the transcription's text, and
		 - creates and enables a button to expand and collapse the text. */
export default class TestimonyTranscription {
	constructor(name) {
		this.name = name;
		this.expanded = false;
		this.height = 200;

		this.fetchTranscription();
		this.createMainDiv();
		this.createAndRenderSpinner();
		this.transcription.then(t => {
			this.transcription = t;
			this.removeSpinner();
			this.createTextDiv();
			this.createMoreButton();
		});
	}

	createMainDiv() {
		this.mainDiv = document.createElement('div');
	}
	
	fetchTranscription() {
		this.transcription = fetch(`/testimonies/${this.name}.txt`)
			.then(res => res.text())
			.then(text => text.split('\n\n'));
	}

	createAndRenderSpinner() {
		this.spinner = new Spinner();
		this.mainDiv.append(this.spinner.div);
	}

	removeSpinner() {
		this.spinner.div.remove();
	}

	createTextDiv() {
		this.textDiv = document.createElement('div');
		this.textDiv.style.marginBottom = '5px';
		this.textDiv.style.transition = 'max-height 0.05s';
		this.textDiv.style.scrollBehavior = 'smooth';
		this.mainDiv.append(this.textDiv);

		for (let line of this.transcription) {
			let [timestamp, text] = line.split('\n');
			let p = document.createElement('p');
			p.id = timestamp;
			p.append(text);
			p.style.margin = '0px';
			p.style.textIndent = '25px';
			this.textDiv.append(p);
		}
	}

	expandTranscription() {
		this.expanded = true;
		this.textDiv.style.maxHeight = `${window.innerHeight - 200}px`;
		this.textDiv.style.overflow = 'scroll';
		this.moreButton.innerText = 'Show less text';
		// We use set timeout here to avoid scrolling to an incorrect position
		// caused by the textDiv.style.transition for it's max-height property which
		// is set a few lines above.
		setTimeout(() => window.scroll(0, this.mainDiv.offsetTop - 100), 60);
	}

	collapseTranscription() {
		this.expanded = false;
		this.textDiv.style.maxHeight = `${this.height}px`;
		this.textDiv.style.overflow = 'hidden';
		this.textDiv.scroll(0, 0);
		this.moreButton.innerText = 'Show more text';
	}

	toggleTranscription() {
		this.expanded? this.collapseTranscription() : this.expandTranscription();
	}

	createMoreButton() {
		this.moreButton = document.createElement('button');
		this.moreButton.style.marginBottom = '5px';
		this.moreButton.onclick = () => this.toggleTranscription();
		this.mainDiv.appendChild(this.moreButton);
		this.collapseTranscription();
	}
}
