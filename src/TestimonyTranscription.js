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
  constructor(id) {
    this.id = id;

    this.fetchTranscription();
    this.createRootDiv();
    this.createAndRenderSpinner();
    this.transcription.then((t) => {
      this.transcription = t;
      this.removeSpinner();
      this.createTextDiv();
      this.organizeTranscriptionInTextDiv();
    });
  }

  createRootDiv() {
    this.rootDiv = document.createElement('div');
  }

  // This method assigns the fetch Promise to this.transcription so that
  // subclasses can correctly await it.
  fetchTranscription() {
    this.transcription = fetch(`/testimonies/${this.id}.txt`)
      .then((res) => res.text())
      .then((text) => text.split('\n\n'));
  }

  createAndRenderSpinner() {
    this.spinner = new Spinner();
    this.rootDiv.append(this.spinner.div);
  }

  removeSpinner() {
    this.spinner.div.remove();
  }

  createTextDiv() {
    this.textDiv = document.createElement('div');
    this.textDiv.style.marginBottom = '5px';
    this.textDiv.style.transition = 'max-height 0.02s';
    this.textDiv.style.scrollBehavior = 'smooth';
    this.rootDiv.append(this.textDiv);
  }

  organizeTranscriptionInTextDiv() {
    this.textDiv.append(this.transcription.toString());
  }
}

/* PreviewTranscription is a Transcription plus a toolbar with an
	 expand-collapse button and a link to a full page. */
class TestimonyTranscriptionPreview extends TestimonyTranscription {
  constructor(id) {
    super(id);

    this.expanded = false;
    this.transcription.then((t) => {
      this.transcription = t;
      this.createToolBar();
      this.createMoreButton();
      this.createLink();
    });
  }

  createToolBar() {
    this.toolBar = document.createElement('div');
    this.toolBar.style.display = 'flex';
    this.toolBar.style.justifyContent = 'space-between';
    this.rootDiv.append(this.toolBar);
  }

  expandText() {
    this.expanded = true;
    this.textDiv.style.maxHeight = `${window.innerHeight - 200}px`;
    this.textDiv.style.overflow = 'scroll';
    this.moreButton.innerText = 'Show less text';
    // We use set timeout here to avoid scrolling to an incorrect position
    // caused by the textDiv.style.transition for it's max-height property which
    // is set a few lines above.
    setTimeout(() => window.scroll(0, this.rootDiv.offsetTop - 100), 40);
  }

  collapseText() {
    this.expanded = false;
    this.textDiv.style.maxHeight = `200px`;
    this.textDiv.style.overflow = 'hidden';
    this.textDiv.scroll(0, 0);
    this.moreButton.innerText = 'Show more text';
  }

  toggleText() {
    this.expanded ? this.collapseText() : this.expandText();
  }

  createMoreButton() {
    this.moreButton = document.createElement('button');
    this.moreButton.style.marginBottom = '5px';
    this.moreButton.onclick = () => this.toggleText();
    this.toolBar.appendChild(this.moreButton);
    this.collapseText();
  }

  createLink() {
    let link = document.createElement('a');
    link.href = `/audio.html?id=${this.id}`;
    link.append(`Open account in a new page`);
    this.toolBar.append(link);
  }
}

export class TestimonyTranscriptionPage extends TestimonyTranscription {
  createRootDiv() {
    this.rootDiv = document.createElement('div');
    this.rootDiv.style.margin = 'auto';
    let divWidth =
      window.innerWidth > 1000
        ? window.innerWidth * 0.5
        : window.innerWidth * 0.9;
    this.rootDiv.style.width = `${divWidth}px`;
  }
}

class AudioTranscriptionFormatter {
  constructor(transcription, textDiv) {
    this.transcription = transcription;
    this.textDiv = textDiv;
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

export class AudioTestimonyTranscriptionPreview extends TestimonyTranscriptionPreview {
  organizeTranscriptionInTextDiv() {
    this.formatter = new AudioTranscriptionFormatter(
      this.transcription,
      this.textDiv,
    );
  }
}

export class AudioTestimonyTranscriptionPage extends TestimonyTranscriptionPage {
  organizeTranscriptionInTextDiv() {
    this.formatter = new AudioTranscriptionFormatter(
      this.transcription,
      this.textDiv,
    );
  }
}

class DocumentTranscriptionFormatter {
  constructor(transcription, textDiv) {
    this.transcription = transcription;
    this.textDiv = textDiv;
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

export class DocumentTestimonyTranscriptionPreview extends TestimonyTranscriptionPreview {
  organizeTranscriptionInTextDiv() {
    this.formatter = new DocumentTranscriptionFormatter(
      this.transcription,
      this.textDiv,
    );
  }
}

export class DocumentTestimonyTranscriptionPage extends TestimonyTranscriptionPage {
  organizeTranscriptionInTextDiv() {
    this.formatter = new DocumentTranscriptionFormatter(
      this.transcription,
      this.textDiv,
    );
  }
}
