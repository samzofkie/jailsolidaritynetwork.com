const { newDBConnection } = require('./utils.js');

class TestimonyCreationValidatorError extends Error {}

class TestimonyCreationValidator {
  constructor(inputs, files) {
    console.log(inputs);
    this.inputs = inputs;
    this.files = files;
  }

  validateDate() {
    if (!(/^\d{4}-\d{2}-\d{2}$/.test(this.inputs.date)))
      throw new TestimonyCreationValidatorError('\'date\' value ill-formed!');
  }

  async validateDivisions() {
    const validDivisions = (await this.client.query('SELECT * FROM divisions'))
      .rows.map(row => row.name);
    const divisions = this.inputs.divisions.split(',').filter(d => d);
    if (!divisions.every(d => validDivisions.includes(d)))
      throw new TestimonyCreationValidatorError(
        'One of the values in \'divisions\' is\'nt in the database!'
      );
  }

  validateLengthOfStay() {
    if (!(/^\d+$/.test(this.inputs.lengthOfStay)))
      throw new TestimonyCreationValidatorError(
        'Value passed for \'lengthOfStay\' is ill-formed!'
      );
  }
  
  async validateGender() {
    const validGenders = (await this.client.query('SELECT * FROM genders'))
      .rows.map(row => row.name);
    if (!validGenders.includes(this.inputs.gender))
      throw new TestimonyCreationValidatorError(
        'Value passed for \'gender\' is\'nt in the database!'
      );
  }
  
  async validateTranscription() {
    const validCategoryShorthands = (await this.client.query('SELECT * FROM categories'))
      .rows.map(row => row.shorthand);
    
    const sentences = this.inputs.transcription.match(/[^.?!]+[.?!]\S*/g)
      ?.map(s => s.trim());

    if (!sentences)
      throw new TestimonyCreationValidatorError(
        'No properly formed sentences in value passed for \'transcription\'!'
      );

    const parsedSentenceObjects = sentences.map(s => {
      const [text, punct, tags] = s.split(/([.!?])/);
      if (!text.length)
        throw new TestimonyCreationValidatorError(
          'One of the sentences passed in \'transcription\' has no text, it\'s only whitespace.'
        );
      return {
        text: text + punct,
        tags: tags.replace('<','').replace('>','').split(',').filter(tag => tag),
      };
    });

    for (const sentenceObject of parsedSentenceObjects) {
      if (!(/^[^<]+(?:<[A-Z,]+>)?$/.test(sentenceObject.text)))
        throw new TestimonyCreationValidatorError (
          'One of the sentences passed in \'transcription\' is ill-formed-- a sentence can\'t use the \'<\' character unless it\'s to encode a category tag, and encoding category tags can only happen after the punctuation and must use capital letters and \',\' to denote categories.'
        );
      if (!(sentenceObject.tags.every(
        tag => validCategoryShorthands.includes(tag)
      )))
        throw new TestimonyCreationValidatorError(
          'One of the sentences passed in \'transcription\' is tagged with a category shorthand that is\'nt in the database!'
        );
    }
  }
  
  // validateFiles

  async validate() {
    this.client = await newDBConnection();
    this.validateDate();
    await this.validateDivisions();
    this.validateLengthOfStay();
    await this.validateGender();
    await this.validateTranscription();
  }
}

module.exports = {
  TestimonyCreationValidator,
  TestimonyCreationValidatorError,
};