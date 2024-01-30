async function fetchTestimoniesManifest() {
  const response = await fetch('/manifest.json');
  const manifest = await response.json();
	return manifest.testimonies;
}

async function renderTestimonyCards(testimonies) {
	for (let testimony of testimonies) {
		let card = document.createElement('div');
		card.style.padding = '5px';
		card.style.margin = '5px';
		card.style.border = '2px solid black';
		card.style.borderRadius = '30px';
	  card.style.width = '400px';
		card.style.backgroundColor = '#dddddd';

		let title = document.createElement('p');
		title.append(testimony.name);
		card.appendChild(title);
		if (testimony.type === 'audio') {
			let audio = document.createElement('audio');
			audio.controls = true;
			audio.style.width = '100%';
			audio.style.borderRadius = '30px';
			let audioSource = document.createElement('source');
			audioSource.src = `testimonies/${testimony.name}.mp3`;
			audioSource.type = 'audio/mpeg';
			audio.appendChild(audioSource);
			card.appendChild(audio);
		}

	  const response = await fetch(`/testimonies/${testimony.name}.txt`);
		const transcription = await response.text();

		console.log(transcription);

		

		document.body.appendChild(card); 
	}
}

async function main() {
	const testimonies = await fetchTestimoniesManifest();
	renderTestimonyCards(testimonies);
}

main();
