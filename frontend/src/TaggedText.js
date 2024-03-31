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
      setTimeout(this.sheet.deleteRule(0), 0);
    }
  }

  highlightAll() {
    Store.taggedText.allSentences().map(sentence => {
      if (!sentence.tags.size) {
        return;
      }
      const categories = [...sentence.tags].map(shorthand => 
        Store.categories.find(category => category.shorthand === shorthand));
      const backgroundColors  = categories.map(category => category.backgroundColor);
      const textColors = categories.map(category => category.color);
      const textColor = textColors.filter(color => color === 'black').length > textColors.filter(color => color === 'white') ? 'black' : 'white';

      const percentageStep = Math.floor(100 / backgroundColors.length);
      let colorStops = [];
      for (let i = 0; i < backgroundColors.length; i++) {
        colorStops.push(`${backgroundColors[i]} ${percentageStep * i}% ${percentageStep * (i + 1)}%`)
      }

      const colorRule = `color: ${textColor};`
      const backgroundRule = `background: linear-gradient(180deg, ${
        colorStops.join(', ')
      });`
      const rule = `#${sentence.id} { ${colorRule} ${backgroundRule} }`;
      this.sheet.insertRule(rule);
    });
  }

  highlightSelected() {
    const taggedSentences = Store.taggedText.allSentences()
      .filter(sentence => sentence.tags.has(Store.currentCategory.shorthand));
    if (!taggedSentences.length) return;
    const selector = taggedSentences.map(sentence => '#' + sentence.id).join(', ');
    const rule = `${selector} { background-color: ${Store.currentCategory.backgroundColor}; color: ${Store.currentCategory.color}; }`;
    this.sheet.insertRule(rule);
  }

  highlight() {
    this.clearRules();
    console.log('cleared', this.sheet.cssRules);
    if (Store.highlightAll) {
      this.highlightAll();
    } else {
      this.highlightSelected();
    }
  }
}

export class TaggedText {
  constructor() {
    this.ir = [];
  }

  // TODO: unit test and input validation
  parseSentences(paragraph) {
    return paragraph.match(/[^.?!]*[.?!]\S*/g)
      .map(sentence => sentence.trim())
      .map(sentence => ({
        id: nanoid(),
        text: sentence.match(/[^<]+/)[0],
        tags: new Set(
          sentence.match(/<[A-Z,]*>/)
            ?.at(0)
            .match(/[A-Z,]+/g)[0]
            .split(',')
        ),
      }));
  }

  readInPlainText(text) {
    this.ir = text.split('\n\n').map(paragraph => ({
      id: nanoid(),
      sentences: this.parseSentences(paragraph),
    }));
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
        paragraphNode.append(sentenceNode, ' ');
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
      
    for (let i = startIndex; i <= endIndex; i++) {
      this.allSentences()[i].tags.add(Store.currentCategory.shorthand);
    }

    Store.cssHighlighter.highlight();
  }

  getPlainText() {
    return this.ir.map(paragraph =>
      paragraph.sentences.map(sentence => 
        sentence.text + 
        (sentence.tags.size? '<' + [...sentence.tags].join() + '>' : '') +
        ' '
      ).join('')
    ).join('\n\n');
  }
}