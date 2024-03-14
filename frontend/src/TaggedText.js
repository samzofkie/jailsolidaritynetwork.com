export class TaggedText {
  constructor(categories) {
    this.paragraphs = [];
  }

  // TODO: unit test and input validation
  splitIntoSentences(paragraph) {
    let sentencesAndPunctuation = paragraph.split(/([.!?])/).filter(text => text !== '');
    let sentences = [];
    for (let i=0; i<sentencesAndPunctuation.length; i += 2) {
      sentences.push(sentencesAndPunctuation[i] + sentencesAndPunctuation[i+1])
    }
    return sentences;
  }

  parseParagraphs(text) {
    this.paragraphs = text.split('\n\n').map(paragraph => this.splitIntoSentences(paragraph));
  }

  setText(text) {
    this.parseParagraphs(text);
  }
}