document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'box-border';

let logo = document.createElement('img');
logo.src = 'jsn-logo-transparent.png';
logo.alt = 'Jail Solidarity Network logo';
logo.width = 500;
document.body.append(logo);

const urlParams = new URLSearchParams(window.location.search);
document.body.append(urlParams.get('id'));
