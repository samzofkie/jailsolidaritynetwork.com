import { Component } from './Component';
import { nanoid } from 'nanoid';

export class TaggedText {
  constructor() {
    this.ir = [];
  }

  // TODO: unit test and input validation
  splitIntoSentences(paragraph) {
    let sentencesAndPunctuation = paragraph.split(/([.!?])/).filter(text => text !== '');
    let sentences = [];
    for (let i=0; i < sentencesAndPunctuation.length; i += 2) {
      sentences.push({
        id: nanoid(),
        text: sentencesAndPunctuation[i] + sentencesAndPunctuation[i+1],
        tags: [],
        startTags: [],
        endTags: [],
      });
    }
    return sentences;
  }

  readInPlainText(text) {
    this.ir = text.split('\n\n').map(paragraph => {return {
      id: nanoid(),
      sentences: this.splitIntoSentences(paragraph),
    }});
  }

  getHTMLNodes() {
    return this.ir.map(paragraph => {
      let paragraphNode = new Component('p');
      paragraphNode.root.id = paragraph.id;
      paragraph.sentences.map(sentence => {
        let sentenceNode = new Component('span');
        sentenceNode.root.id = sentence.id;
        sentenceNode.root.className = 'Sentence';          
        sentenceNode.append(sentence.text);
        paragraphNode.append(sentenceNode);
      });
      return paragraphNode;
    });
  }

  selectionIsInParagraphsDiv(selection) {
    return !selection.isCollapsed &&
           selection.anchorNode &&
           selection.focusNode &&
           (selection.anchorNode.parentNode.className === 'Sentence' ||
            selection.anchorNode.parentNode.className === 'ParagraphsDiv');
  }

  tag(category) {
    const selection = getSelection();

    if (!this.selectionIsInParagraphsDiv(selection)) {
      return;
    }

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    const startSentenceId = anchorNode.nodeName === '#text' ? 
      anchorNode.parentNode.id :
      anchorNode.firstChild.id;
    const endSentenceId = focusNode.nodeName === '#text' ?
      focusNode.parentNode.id :
      anchorNode.lastChild.id;

    const allSentences = this.ir.map(paragraph => paragraph.sentences).flat();
    const allIds = allSentences.map(sentence => sentence.id);
    const startIndex = allIds.indexOf(startSentenceId);
    const endIndex = allIds.indexOf(endSentenceId);
      
    // Add category shorthand string to .startTags of the first sentence, and .endTags of the last sentence.
    allSentences[startIndex].startTags.push(category.shorthand);
    allSentences[endIndex].endTags.push(category.shorthand);
      
    // Add category name string to the .tags of all the selected sentences.
    for (let i = startIndex; i <= endIndex; i++) {
      allSentences[i].tags.push(category.name);
    }

    console.log(this.ir);
    // TODO: tweak CSS
  }
}