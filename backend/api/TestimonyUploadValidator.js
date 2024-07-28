class TestimonyUploadValidatorError extends Error {}

class TestimonyUploadValidator {
  constructor(pool) {
    this.pool = pool;
    this.errorMessage = '';
  }

  validateDate(date) {
    if (!(/^\d{4}-\d{2}-\d{2}$/.test(date)))
      throw new TestimonyUploadValidatorError('\'date\' value ill-formed!');
  }

  async validateDivisions(divisions) {
    const validDivisions = (await this.pool.query('SELECT * FROM divisions')).rows
      .map(row => row.name);
    divisions = divisions.split(',').filter(d => d);
    if (!divisions.every(d => validDivisions.includes(d)))
      throw new TestimonyUploadValidatorError(
        'One of the values in \'divisions\' is\'nt in the database!'
      );
  }

  validateLengthOfStay(lengthOfStay) {
    if (!(/^\d+$/.test(lengthOfStay)))
      throw new TestimonyUploadValidatorError(
        'Value passed for \'lengthOfStay\' is ill-formed!'
      );
  }

  validateGender(gender) {
    const validGenders = ['Male', 'Female', 'Non-binary', 'Other'];
    if (!validGenders.includes(gender))
      throw new TestimonyUploadValidatorError(
        'Value passed for \'gender\' is\'nt in the database!'
      );
  }

  async validateTranscription(transcription) {
    const validCategoryShorthands = (await this.pool.query('SELECT * FROM categories')).rows
      .map(row => row.shorthand);
        
    const sentences = transcription.match(/[^.?!]+[.?!]\S*/g)
      ?.map(s => s.trim());

    if (!sentences)
      throw new TestimonyUploadValidatorError(
        'No properly formed sentences in value passed for \'transcription\'!'
      );

    const parsedSentenceObjects = sentences.map(s => {
      const [text, punct, tags] = s.split(/([.!?])/);
      if (!text.length)
        throw new TestimonyUploadValidatorError(
          'One of the sentences passed in \'transcription\' has no text, it\'s only whitespace.'
        );
      return {
        text: text + punct,
        tags: tags.replace('<','').replace('>','').split(',').filter(tag => tag),
      };
    });

    for (const sentenceObject of parsedSentenceObjects) {
      if (!(/^[^<]+(?:<[A-Z,]+>)?$/.test(sentenceObject.text)))
        throw new TestimonyUploadValidatorError (
          'One of the sentences passed in \'transcription\' is ill-formed-- a sentence can\'t use the \'<\' character unless it\'s to encode a category tag, and encoding category tags can only happen after the punctuation and must use capital letters and \',\' to denote categories.'
        );
      if (!(sentenceObject.tags.every(
        tag => validCategoryShorthands.includes(tag)
      )))
        throw new TestimonyUploadValidatorError(
          'One of the sentences passed in \'transcription\' is tagged with a category shorthand that is\'nt in the database!'
        );
    }
  }

  async validate(inputs) {
    try {
      this.validateDate(inputs.date);
      await this.validateDivisions(inputs.divisions);
      this.validateLengthOfStay(inputs.lengthOfStay);
      this.validateGender(inputs.gender);
      await this.validateTranscription(inputs.transcription);
    } catch (error) {
      if (error instanceof TestimonyUploadValidatorError) {
        this.errorMessage = error.message;
        return false;
      } else {
        throw error;
      }
    }
    return true;
  }
}

module.exports = {
  TestimonyUploadValidator
};