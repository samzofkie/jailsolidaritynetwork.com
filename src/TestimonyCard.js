import TestimonyTranscription from './TestimonyTranscription.js';

/* TestimonyCard's parameter is an object, (currently) with the following 
	 properties:
	 	 - name: a unique identifier,
	 	 - type: either "audio" or "document",
	 	 - date: a month and year combo of the format "YYYY-MM".
	 It's main functionality is managing the creation and rendering of a
	   - root div, a
	 	 - title (and relevant meta-data), and a
	 	 - TestimonyTranscription. */
class TestimonyCard {
  constructor(testimony) {
    this.name = testimony.name;
    this.type = testimony.type;
    this.date = new Date(testimony.date);

    this.createRootDiv();
    this.createTitle();
    this.createTranscription();
  }

  createRootDiv() {
    this.rootDiv = document.createElement('div');
    this.rootDiv.style.padding = '5px';
    this.rootDiv.style.margin = '5px';
    this.rootDiv.style.border = '2px solid black';
    this.rootDiv.style.width = '400px';
    this.rootDiv.style.backgroundColor = '#dddddd';
    document.body.append(this.rootDiv);
  }

  createTitle() {
    this.title = document.createElement('p');
    this.title.style.fontWeight = 'bold';
    this.title.append(
      `Recorded ${this.date.toLocaleString('default', { month: 'long' })}, ${this.date.getUTCFullYear()}`,
    );
    this.rootDiv.append(this.title);
  }

  createTranscription() {
    this.transcription = new TestimonyTranscription(this.name);
    this.rootDiv.append(this.transcription.mainDiv);
  }
}

export class AudioTestimonyCard extends TestimonyCard {
  constructor(testimony) {
    super(testimony);
    this.createAudioPlayer();
  }

  createAudioPlayer() {
    this.audio = document.createElement('audio');
    this.audio.controls = true;
    this.audio.style.width = '100%';

    let audioSource = document.createElement('source');
    audioSource.src = `testimonies/${this.name}.mp3`;
    audioSource.type = 'audio/mpeg';
    this.audio.appendChild(audioSource);

    this.rootDiv.append(this.audio);
  }
}
