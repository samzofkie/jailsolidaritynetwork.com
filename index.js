import { AudioTestimonyCard } from "./src/TestimonyCard.js";

async function fetchTestimonyManifest() {
  const response = await fetch('/manifest.json');
  const manifest = await response.json();
	return manifest.testimonies;
}

function createTestimonyCards(testimonyManifest) {
	let testimonyCards = [];
	for (let testimony of testimonyManifest) {
		if (testimony.type === 'audio')
			testimonyCards.push(new AudioTestimonyCard(testimony));	
	}
}

document.documentElement.style.scrollBehavior = 'smooth';
document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'border-box';

fetchTestimonyManifest().then(createTestimonyCards);
