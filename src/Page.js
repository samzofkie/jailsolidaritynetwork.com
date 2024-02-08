import Logo from './Logo.js';
import { AudioTestimonyTranscriptionPage } from './TestimonyTranscription.js';
import AudioPlayer from './AudioPlayer.js';

class Page {
  constructor() {
    this.root = document.body;
    this.isMobile = window.innerWidth < 800;
  }
}

class PageHeader {
  constructor(titleText, isMobile) {
    this.titleText = titleText;
    this.isMobile = isMobile;

    this.createRoot();
    this.createLogo();
    this.createTitle();
    this.createHr();
  }

  createRoot() {
    this.root = document.createElement('div');
    this.root.style.width = '100%';
    this.root.style.backgroundColor = '#b0b0ab';
    if (!this.isMobile) {
      this.root.style.display = 'grid';
      this.root.style.gridTemplateColumns = `repeat(4, 25%)`;
    }
    this.root.style.position = 'fixed';
    this.root.style.top = '0px';
    this.root.style.left = '0px';
  }

  createLogo() {
    this.logo = new Logo(this.isMobile ? '50%' : '100%');
    this.root.append(this.logo.img);
    this.logoLoaded = new Promise((res, rej) => {
      this.logo.img.addEventListener('load', res);
    });
  }

  createTitle() {
    let titleContainer = document.createElement('div');
    titleContainer.style.margin = '5px';
    titleContainer.style.display = 'flex';
    titleContainer.style.flexDirection = 'column';
    titleContainer.style.justifyContent = 'center';
    if (!this.isMobile) {
      titleContainer.style.gridColumn = '2 /span 3';
    }

    let title = document.createElement('h2');
    title.append(this.titleText);

    titleContainer.append(title);
    this.root.append(titleContainer);
  }

  createHr() {
    let hrContainer = document.createElement('div');
    hrContainer.style.gridColumn = '1 /span 4';
    let hr = document.createElement('hr');
    hr.style.margin = '8px';
    hrContainer.append(hr);
    this.root.append(hrContainer);
  }
}

export class AudioTestimonyPage extends Page {
  constructor(testimonyMetadata) {
    super();
    this.testimonyMetadata = testimonyMetadata;

    this.createHeader();
    this.createAudioPlayer();

    // Wait for the header's logo to load to correctly calculate the marginTop
    // for the transcription <div>
    this.header.logoLoaded.then((_) => {
      this.createTranscription();
    });
  }

  createHeader() {
    let date = new Date(this.testimonyMetadata.date);
    let titleText = `Recorded ${date.toLocaleString('default', { month: 'long' })}, ${date.getUTCFullYear()}`;
    this.header = new PageHeader(titleText, this.isMobile);
    this.root.append(this.header.root);
  }

  createTranscription() {
    let transcriptionContainer = document.createElement('div');
    transcriptionContainer.style.marginTop = `${this.header.root.offsetHeight}px`;
    if (!this.isMobile) {
      transcriptionContainer.style.width = '100%';
      transcriptionContainer.style.display = 'grid';
      transcriptionContainer.style.gridTemplateColumns = 'repeat(4, 25%)';
    }

    let transcription = new AudioTestimonyTranscriptionPage(
      this.testimonyMetadata,
    );
    transcription.rootDiv.style.gridColumn = '2 / span 2';

    transcriptionContainer.append(transcription.rootDiv);
    this.root.append(transcriptionContainer);
  }

  createAudioPlayer() {
    let audioPlayer = new AudioPlayer(this.testimonyMetadata.id);
    audioPlayer.audio.style.position = 'fixed';
    audioPlayer.audio.style.bottom = '0px';
    audioPlayer.audio.style.left = '0px';
    this.root.append(audioPlayer.audio);
  }
}
