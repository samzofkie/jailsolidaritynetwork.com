import TestimonyCard from "./src/TestimonyCard.js";

async function fetchTestimonyManifest() {
  const response = await fetch('/manifest.json');
  const manifest = await response.json();
	return manifest.testimonies;
}

function createCard(testimonyName) {
	let card = document.createElement('div');
	card.style.padding = '5px';
	card.style.margin = '5px';
	card.style.border = '2px solid black';
	//card.style.borderRadius = '30px';
  card.style.width = '400px';
	card.style.backgroundColor = '#dddddd';

	let title = document.createElement('p');
	title.append(testimonyName);
	card.appendChild(title);

	return card;
}

function createAudioPlayer(testimonyName) {
	let audio = document.createElement('audio');
	audio.controls = true;
	audio.style.width = '100%';
	//audio.style.borderRadius = '30px';

	let audioSource = document.createElement('source');
	audioSource.src = `testimonies/${testimonyName}.mp3`;
	audioSource.type = 'audio/mpeg';
	audio.appendChild(audioSource);

	return audio
}

function createTranscriptionLayout(transcription) {
	let container = document.createElement('div');
	for (let line of transcription) {
		let [timestamp, text] = line.split('\n');
		let p = document.createElement('p');
		p.append(text);
		p.style.margin = '0px';
		container.append(p);
	}
	return container;
}

async function renderTestimonyCards(testimonies) {
	for (let testimony of testimonies) {
		let card = createCard(testimony.name);
		const transcription = await fetchTestimonyTranscription(testimony.name);
		const transcriptionLayout = createTranscriptionLayout(transcription.split('\n\n'));

		card.append(transcriptionLayout);

		if (testimony.type === 'audio') {
			card.appendChild(createAudioPlayer(testimony.name));
		}

		document.body.appendChild(card); 
	}
}

function createTestimonyCards(testimonyManifest) {
	let testimonyCards = [];
	for (let testimonyEntry of testimonyManifest) {
		testimonyCards.push(new TestimonyCard(testimonyEntry));
		
	}
}

async function main() {
	const testimonyManifest = await fetchTestimonyManifest();
	let testimonyCards = createTestimonyCards(testimonyManifest);
	//renderTestimonyCards(testimonyManifest);
}

main();
