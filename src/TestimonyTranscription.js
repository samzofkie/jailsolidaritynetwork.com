import Spinner from './Spinner.js';

/* TestimonyTranscription
	   - creates a div,
		 - initiates the fetch of the transcription text, and
		 - creates and renders a spinner
	 Then, when the network request finishes, it
	 	 - initializes the transcription member,
		 - removes the spinner,
		 - creates a div to contain the transcription's text,
		 - calls organizeTranscriptionInTextDiv() to arrange the transcription in
		 	 the textDiv, and
		 - creates and enables a button to expand and collapse the text.
	 Whoever wants a TestimonyTranscription is responsible for inserting mainDiv
	 wherever they want it in the DOM.
	 ATM, TestimonyTranscription will organizeTranscriptionInTextDiv by just
	 appending this.transcription.toString() to this.textDiv. This method is
	 convenient to override in a subclass to implement a subclass-specific
	 algorithm to layout text elements inside the textDiv.
*/
export class TestimonyTranscription {
  constructor(name) {
    this.name = name;
    this.expanded = false;
    this.height = 200;

    this.fetchTranscription();
    this.createMainDiv();
    this.createAndRenderSpinner();
    this.transcription.then((t) => {
      this.transcription = t;
      this.removeSpinner();
      this.createTextDiv();
      this.organizeTranscriptionInTextDiv();
      this.createMoreButton();
    });
  }

  createMainDiv() {
    this.mainDiv = document.createElement('div');
  }

  fetchTranscription() {
    this.transcription = fetch(`/testimonies/${this.name}.txt`)
      .then((res) => res.text())
      .then((text) => text.split('\n\n'));
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
    this.textDiv.style.transition = 'max-height 0.02s';
    this.textDiv.style.scrollBehavior = 'smooth';
    this.mainDiv.append(this.textDiv);
  }

  organizeTranscriptionInTextDiv() {
    this.textDiv.append(this.transcription.toString());
  }

  expandTranscription() {
    this.expanded = true;
    this.textDiv.style.maxHeight = `${window.innerHeight - 200}px`;
    this.textDiv.style.overflow = 'scroll';
    this.moreButton.innerText = 'Show less text';
    // We use set timeout here to avoid scrolling to an incorrect position
    // caused by the textDiv.style.transition for it's max-height property which
    // is set a few lines above.
    setTimeout(() => window.scroll(0, this.mainDiv.offsetTop - 100), 40);
  }

  collapseTranscription() {
    this.expanded = false;
    this.textDiv.style.maxHeight = `${this.height}px`;
    this.textDiv.style.overflow = 'hidden';
    this.textDiv.scroll(0, 0);
    this.moreButton.innerText = 'Show more text';
  }

  toggleTranscription() {
    this.expanded ? this.collapseTranscription() : this.expandTranscription();
  }

  createMoreButton() {
    this.moreButton = document.createElement('button');
    this.moreButton.style.marginBottom = '5px';
    this.moreButton.onclick = () => this.toggleTranscription();
    this.mainDiv.appendChild(this.moreButton);
    this.collapseTranscription();
  }
}

/* AudioTestimonyTranscription overrides organizeTranscriptionInTextDiv to
   append <p>s to textDiv, setting the id property of each paragraph to a
	 string timestamp corresponding to the schema of audio transcription text
	 (see README for more info). */
export class AudioTestimonyTranscription extends TestimonyTranscription {
  constructor(name) {
    super(name);
  }

  organizeTranscriptionInTextDiv() {
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
}

export class DocumentTestimonyTranscription extends TestimonyTranscription {
  constructor(name) {
    super(name);
  }

  organizeTranscriptionInTextDiv() {
    for (let line of this.transcription) {
      if (line.length === 0) continue;
      let p = document.createElement('p');
      p.append(line);
      p.style.margin = '0px';
      p.style.textIndent = '25px';
      this.textDiv.append(p);
    }
  }
}
