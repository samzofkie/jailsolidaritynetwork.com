import Logo from './src/Logo.js';
import AudioPlayer from './src/AudioPlayer.js';
import { AudioTestimonyTranscriptionPage } from './src/TestimonyTranscription.js';

document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'box-border';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

let logo = new Logo(300);
document.body.append(logo.img);

let transcription = new AudioTestimonyTranscriptionPage(id);
document.body.append(transcription.rootDiv);

let audioPlayer = new AudioPlayer(id);
audioPlayer.audio.style.position = 'fixed';
audioPlayer.audio.style.bottom = '0px';
audioPlayer.audio.style.left = '0px';
document.body.append(audioPlayer.audio);
