import Logo from './src/Logo.js';

document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'box-border';

const urlParams = new URLSearchParams(window.location.search);

let logo = new Logo(300);
document.body.append(logo.img);

let title = document.createElement('h3');
title.append('Search jail testimonies');
document.body.append(title);

let comingSoon = document.createElement('p');
comingSoon.append('Coming soon');
document.body.append(comingSoon);
