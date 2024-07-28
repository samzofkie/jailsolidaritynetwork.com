class TestimonyValidationError extends Error {}

class Testimony {
  constructor(inputs, pool) {
    this.inputs = inputs;
    this.pool = pool;
    this.date = inputs.date;
    this.divisions = inputs.divisions.split(',').filter(d => d);
    this.lengthOfStay = inputs.lengthOfStay;
    this.gender = inputs.gender;
    this.transcription = this.parseTranscription(inputs.transcription);
    this.errorMessage = '';
  }

  parseTranscription(transcription) {
    const sentences = transcription.match(/[^.?!]+[.?!]\S*/g)
      ?.map(s => s.trim());

    return sentences.map(s => {
      const [text, punct, tags] = s.split(/([.!?])/);
      if (!text.length)
        throw new TestimonyValidationError(
          'One of the sentences passed in \'transcription\' has no text, it\'s only whitespace.'
        );
      return {
        text: text + punct,
        tags: tags.replace('<','').replace('>','').split(',').filter(tag => tag),
      };
    });
  }

  static validateDate(date) {
    if (!(/^\d{4}-\d{2}-\d{2}$/.test(date)))
      throw new TestimonyValidationError('\'date\' value ill-formed!');
  }

  static async validateDivisions(divisions, pool) {
    const validDivisions = (await pool.query('SELECT * FROM divisions')).rows
      .map(row => row.name);
    if (!divisions.every(d => validDivisions.includes(d)))
      throw new TestimonyValidationError(
        'One of the values in \'divisions\' is\'nt in the database!'
      );
  }

  static validateLengthOfStay(lengthOfStay) {
    if (!(/^\d+$/.test(lengthOfStay)))
      throw new TestimonyValidationError(
        'Value passed for \'lengthOfStay\' is ill-formed!'
      );
  }

  static validateGender(gender) {
    const validGenders = ['Male', 'Female', 'Non-binary', 'Other'];
    if (!validGenders.includes(gender))
      throw new TestimonyValidationError(
        'Value passed for \'gender\' is\'nt in the database!'
      );
  }

  static async validateTranscription(transcription, pool) {
    const validCategoryShorthands = 
      (await pool.query('SELECT * FROM categories')).rows
      .map(row => row.shorthand);

    if (!transcription.length)
      throw new TestimonyValidationError(
        'No properly formed sentences in value passed for \'transcription\'!'
      );

    for (const sentenceObject of transcription) {
      if (!(/^[^<]+(?:<[A-Z,]+>)?$/.test(sentenceObject.text)))
        throw new TestimonyValidationError (
          'One of the sentences passed in \'transcription\' is ill-formed-- a sentence can\'t use the \'<\' character unless it\'s to encode a category tag, and encoding category tags can only happen after the punctuation and must use capital letters and \',\' to denote categories.'
        );
      if (!(sentenceObject.tags.every(
        tag => validCategoryShorthands.includes(tag)
      )))
        throw new TestimonyValidationError(
          'One of the sentences passed in \'transcription\' is tagged with a category shorthand that is\'nt in the database!'
        );
    }
  }

  async validate() {
    try {
      Testimony.validateDate(this.date);
      await Testimony.validateDivisions(this.divisions, this.pool);
      Testimony.validateLengthOfStay(this.lengthOfStay);
      Testimony.validateGender(this.gender);
      await Testimony.validateTranscription(this.transcription, this.pool);
    } catch (error) {
      if (error instanceof TestimonyValidationError) {
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
  Testimony
};