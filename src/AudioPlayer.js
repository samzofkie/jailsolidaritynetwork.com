export default class AudioPlayer {
  constructor(id) {
    this.id = id;
    this.audio = document.createElement('audio');
    this.audio.controls = true;
    this.audio.style.width = '100%';

    let audioSource = document.createElement('source');
    audioSource.src = `testimonies/${this.id}.mp3`;
    audioSource.type = 'audio/mpeg';
    this.audio.appendChild(audioSource);
  }
}
