import TestimonyCard from "./src/TestimonyCard.js";

async function fetchTestimonyManifest() {
  const response = await fetch('/manifest.json');
  const manifest = await response.json();
	return manifest.testimonies;
}

function createTestimonyCards(testimonyManifest) {
	let testimonyCards = [];
	for (let testimonyEntry of testimonyManifest) {
		testimonyCards.push(new TestimonyCard(testimonyEntry));	
	}
}

document.documentElement.style.scrollBehavior = 'smooth';
document.body.style.backgroundColor = '#b0b0ab';
document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
document.body.style.boxSizing = 'border-box';

fetchTestimonyManifest().then(createTestimonyCards);
