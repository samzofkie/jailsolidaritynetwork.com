import TestimonyCard from "./src/TestimonyCard.js";

async function fetchTestimonyManifest() {
  const response = await fetch('/manifest.json');
  const manifest = await response.json();
	return manifest.testimonies;
}

function createAudioPlayer(testimonyName) {
	let audio = document.createElement('audio');
	audio.controls = true;
	audio.style.width = '100%';

	let audioSource = document.createElement('source');
	audioSource.src = `testimonies/${testimonyName}.mp3`;
	audioSource.type = 'audio/mpeg';
	audio.appendChild(audioSource);

	return audio;
}

function createTestimonyCards(testimonyManifest) {
	let testimonyCards = [];
	for (let testimonyEntry of testimonyManifest) {
		testimonyCards.push(new TestimonyCard(testimonyEntry));	
	}
}

async function main() {
	document.documentElement.style.scrollBehavior = 'smooth';
	document.body.style.backgroundColor = '#b0b0ab';
	document.body.style.fontFamily = 'Arial, Helvetica, sans-serif';
	document.body.style.boxSizing = 'border-box';
	const testimonyManifest = await fetchTestimonyManifest();
	let testimonyCards = createTestimonyCards(testimonyManifest);
}

main();
