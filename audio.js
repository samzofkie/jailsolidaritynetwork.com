import Logo from './src/Logo.js';
import AudioPlayer from './src/AudioPlayer.js';
import { AudioTestimonyTranscriptionPage } from './src/TestimonyTranscription.js';

document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'box-border';

const urlParams = new URLSearchParams(window.location.search);
const testimonyMetadata = Object.fromEntries(urlParams);

let logo = new Logo(300);
document.body.append(logo.img);

let transcription = new AudioTestimonyTranscriptionPage(testimonyMetadata);
document.body.append(transcription.rootDiv);

let audioPlayer = new AudioPlayer(testimonyMetadata.id);
audioPlayer.audio.style.position = 'fixed';
audioPlayer.audio.style.bottom = '0px';
audioPlayer.audio.style.left = '0px';
document.body.append(audioPlayer.audio);
