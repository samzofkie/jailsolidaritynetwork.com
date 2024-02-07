import {
  TestimonyTranscription,
  AudioTestimonyTranscription,
  DocumentTestimonyTranscription,
} from './TestimonyTranscription.js';

/* TestimonyCard's parameter is an object, (currently) with the following
	 properties:
		 - name: a unique identifier,
		 - type: either "audio" or "document",
		 - date: a month and year combo of the format "YYYY-MM".
	 It's main functionality is managing the creation and rendering of a
		 - root div, a
		 - title (and relevant meta-data), and a
		 - object inheriting from TestimonyTranscription.
	 The titleText and transcriptionType values are passed as optional parameters
	 so that each subclass can initialize their members with a unique titleText
	 value and transcriptionType with just the standard call to super().
*/
class TestimonyCard {
  constructor(
    testimony,
    width,
    titleText = testimony.name,
    transcriptionType = TestimonyTranscription,
  ) {
    this.name = testimony.name;
    this.type = testimony.type;
    this.date = new Date(testimony.date);
    this.width = width;
    this.titleText = titleText;
    this.transcriptionType = transcriptionType;

    // The padding doesn't matter because document.body has box-sizng =
    // border-box;
    this.margin = 5;
    this.borderWidth = 2;
    this.adjustedWidth = this.width - (this.margin + this.borderWidth) * 2;

    this.createRootDiv();
    this.createTitle();
    this.createTranscription();
  }

  createRootDiv() {
    this.rootDiv = document.createElement('div');
    this.rootDiv.style.padding = '5px';
    this.rootDiv.style.margin = `${this.margin}px`;
    this.rootDiv.style.border = `${this.borderWidth}px solid black`;
    this.rootDiv.style.width = `${this.adjustedWidth}px`;
    this.rootDiv.style.backgroundColor = '#dddddd';
  }

  createTitle() {
    this.title = document.createElement('p');
    this.title.style.fontWeight = 'bold';
    this.rootDiv.append(this.title);
    this.title.innerText = this.titleText;
  }

  createTranscription() {
    this.transcription = new this.transcriptionType(this.name, this.toolBar);
    this.rootDiv.append(this.transcription.mainDiv);
  }
}

export class AudioTestimonyCard extends TestimonyCard {
  constructor(testimony, width = 400) {
    const date = new Date(testimony.date);
    super(
      testimony,
      width,
      `Recorded ${date.toLocaleString('default', { month: 'long' })}, ${date.getUTCFullYear()}`,
      AudioTestimonyTranscription,
    );
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

export class DocumentTestimonyCard extends TestimonyCard {
  constructor(testimony, width = 400) {
    const date = new Date(testimony.date);
    super(
      testimony,
      width,
      `Received ${date.toLocaleString('default', { month: 'long' })}, ${date.getUTCFullYear()}`,
      DocumentTestimonyTranscription,
    );
    this.insertPreviewImage();
  }

  insertPreviewImage() {
    this.previewImage = document.createElement('img');
    this.previewImage.src = `/testimonies/${this.name}.png`;
    this.previewImage.style.width = `${this.adjustedWidth}px`;
    this.title.after(this.previewImage);
  }
}
