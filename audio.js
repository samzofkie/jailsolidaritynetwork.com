/*import { AudioTestimonyPage } from './src/old/Page.js';

document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'box-border';

const urlParams = new URLSearchParams(window.location.search);
const testimonyMetadata = Object.fromEntries(urlParams);

new AudioTestimonyPage(testimonyMetadata);*/
import { AudioTestimonyPage } from './src/Page.js';
let page = new AudioTestimonyPage();
