export default class TestimonyCard {
	constructor(testimonyEntry) {
		this.name = testimonyEntry.name;
		this.type = testimonyEntry.type;
		// !!! ALWAYS USE .toUTC methods for this.date !!!
		this.date = new Date(testimonyEntry.date);
	}

	async fetchTestimonyTranscription() {
  	const response = await fetch(`/testimonies/${testimonyName}.txt`);
		return await response.text();
	}
}
