import { Component} from './Component';
import { nanoid } from 'nanoid';

/* TaggedText exists to translate between two representations of the input text:
     - plain text, input into the TranscriptionInput textarea and passed into the Tagged
       text via the setText method, and
     - an array of HTML <p> nodes, perfect for being sent to TranscriptionHighlighter's 
       appendParagraphs method.
   When TranscriptionHighlighter's tag() event handler method gets called, it reads the
   currentCategory from it's category selector, and passes that by string to TaggedText's
   tag() method. 
   
   Using window.getSelection(), how do we find the corresponding <p> node, and then the
   corresponding location in the plain text?

   The Intermediate Representation TaggedText uses is an array of paragraphs, where each
   paragraph is an object with 
     - an `id` field and
     - a sentences field, which is an array of sentences objects,
   where a sentence object contains a
     - an `id` field, and 
     - a text field, containing the plain text of the sentence.
*/
export class TaggedText {
  constructor(categories) {
    this.ir = [];
    this.HTMLNodes = [];
  }

  // TODO: unit test and input validation
  splitIntoSentences(paragraph, highlighter) {
    let sentencesAndPunctuation = paragraph.split(/([.!?])/).filter(text => text !== '');
    let sentences = [];
    for (let i=0; i<sentencesAndPunctuation.length; i += 2) {
      sentences.push({
        id: nanoid(),
        text: sentencesAndPunctuation[i] + sentencesAndPunctuation[i+1],
      });
    }
    return sentences;
  }

  readInPlainText(text) {
    this.ir = text.split('\n\n').map(paragraph => {return {
      id: nanoid(),
      sentences: this.splitIntoSentences(paragraph),
    }});
    this.createHTMLNodes();
  }

  createHTMLNodes() {
    this.HTMLNodes = this.ir.map(paragraph => {
      let paragraphNode = new Component('p');
      paragraphNode.root.id = paragraph.id;
      paragraph.sentences.map(sentence => {
        let sentenceNode = new Component('span');
        sentenceNode.root.id = sentence.id;          
        sentenceNode.append(sentence.text);
        paragraphNode.append(sentenceNode);
      });
      return paragraphNode;
    });
  }

  getHTMLNodes() {
    return this.HTMLNodes;
  }

  tag(category) {
    console.log(window.getSelection());
  }
}