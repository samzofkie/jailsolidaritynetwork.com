import { Component, Store } from './Component';
import { customAlphabet } from 'nanoid';
// To be valid CSS selectors!
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVBWXYZabcdefghijklmnopqrstuvwxyz', 30);

export class CSSHighlighter {
  constructor() {
    this.sheet = new CSSStyleSheet;
    document.adoptedStyleSheets = [this.sheet];
  }

  clearRules() {
    for (let i=0; i < this.sheet.cssRules.length; i++) {
      this.sheet.deleteRule(0);
    }
  }

  highlight() {
    this.clearRules();
    const taggedSentences = Store.taggedText.allSentences()
      .filter(sentence => sentence.tags.has(Store.currentCategory.name));
    if (!taggedSentences.length) return;
    const selector = taggedSentences.map(sentence => '#' + sentence.id).join(', ');
    const rule = `${selector} { background-color: ${Store.currentCategory.backgroundColor}; color: ${Store.currentCategory.color}; }`;
    this.sheet.insertRule(rule);
  }
}

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
        tags: new Set,
        startTags: new Set,
        endTags: new Set,
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

  allSentences() {
    return this.ir.map(paragraph => paragraph.sentences).flat();
  }

  tag() {
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

    const allIds = this.allSentences().map(sentence => sentence.id);
    const startIndex = allIds.indexOf(startSentenceId);
    const endIndex = allIds.indexOf(endSentenceId);
      
    // Add category shorthand string to .startTags of the first sentence, and .endTags of the last sentence.
    this.allSentences()[startIndex].startTags.add(Store.currentCategory.shorthand);
    this.allSentences()[endIndex].endTags.add(Store.currentCategory.shorthand);
      
    // Add category name string to the .tags of all the selected sentences.
    for (let i = startIndex; i <= endIndex; i++) {
      this.allSentences()[i].tags.add(Store.currentCategory.name);
    }

    Store.cssHighlighter.highlight();
  }

  getPlainText() {
    console.log(this.ir);
    return this.ir.map(paragraph => {
      return paragraph.sentences.map(sentence => {
        let ret = '';
        for (let tag of sentence.startTags) {
          console.log(tag);
        }
        //console.log(sentence);
      });
    });
  }
}