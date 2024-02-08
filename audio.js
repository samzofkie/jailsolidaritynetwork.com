import Logo from './src/Logo.js';

document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'box-border';

let logo = new Logo(300);
document.body.append(logo.img);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');