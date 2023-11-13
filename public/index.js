const MAX_HEIGHT = '100px';

function toggleExpand(event) {
  let transcription = event.target.parentNode.parentNode.childNodes[0];
  if (transcription.style.maxHeight === MAX_HEIGHT) {
    transcription.style.maxHeight = '';
    event.target.style.display = 'none';
  } else {
    transcription.style.maxHeight = MAX_HEIGHT;
    event.target.style.display = '';
  }
}

Array.from(document.getElementsByClassName('transcription-expand')).map(t => t.onclick = toggleExpand);
Array.from(document.getElementsByClassName('transcription')).map(t => t.style.maxHeight = MAX_HEIGHT);
