import {
  AudioTestimonyCard,
  DocumentTestimonyCard,
} from './src/TestimonyCard.js';

async function fetchTestimonyManifest() {
  const response = await fetch('/manifest.json');
  const manifest = await response.json();
  return manifest.testimonies;
}

function createTestimonyCards(testimonyManifest) {
  // https://stackoverflow.com/a/12646864
  for (let i = testimonyManifest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [testimonyManifest[i], testimonyManifest[j]] = [
      testimonyManifest[j],
      testimonyManifest[i],
    ];
  }

  let testimonyCards = [];
  for (let testimony of testimonyManifest) {
    if (testimony.type === 'audio') {
      testimonyCards.push(new AudioTestimonyCard(testimony));
    } else if (testimony.type === 'document') {
      testimonyCards.push(new DocumentTestimonyCard(testimony));
    }
  }
}

document.documentElement.style.scrollBehavior = 'smooth';
document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'border-box';

fetchTestimonyManifest().then(createTestimonyCards);
