// Validation: the assurance that something meets the needs of the consumer. 
// Verification: the evaluation of whether or not something complies with 
//   specification or imposed condition.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('./db.js');
const { formatDate } = require('./utils.js');

function verifyRequestBodyData(req, res, next) {
  if (!(req.body.data instanceof Object))
    return res.status(400).json({
      error: {
        message: 'Request body must be a JSON object with a .data property \
        containing the data to be uploaded.'
      }
    });
  next();
}

async function verifyLoginCredentials(req, res, next) {
  const { username, password } = req.body.data;

  if (/[^\S]+/.test(username) || !username || !password)
    return res.status(400).json({
      error: {
        message: 'Bad request syntax.'
      },
    });

  const { rows } = await db.query(
    'SELECT * FROM users WHERE name = $1', 
    [username]
  );

  const unauthorizedResponseBody = {
    error: {
      message: 'Username or password invalid.'
    }
  };

  if (!rows.length)
    return res.status(401).json(unauthorizedResponseBody);

  const salt = Buffer.from(rows[0].salt, 'hex'),
        hash = Buffer.from(rows[0].hash, 'hex');

  if (!(crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha3-512').equals(hash)))
    return res.status(401).json(unauthorizedResponseBody);

  next();
}

// verifyTestimonyId is middleware designed to return a 400 if the request 
// doesn't include a testimonyId value in the path or if the testimonyId
// value is ill-formed, or a 404 if there is no testimony corresponding to
// that testimonyId value in the database. This should adorn any endpoint with
// a :testimonyId path parameter.
// For convenience, the data read from checking the database for that 
// testimonyId is nicely formatted and placed in a property
// .currentTestimonyObject in the req object.
async function verifyTestimonyId(req, res, next) {
  const testimonyId = req.params?.testimonyId;

  if (
    testimonyId === undefined ||
    (!(/^\d+$/.test(testimonyId)))
  )
    return res.status(400).json({
      error: {
        message: 'Request path must include a valid string value for \
        testimonyId.'
      }
    });

  let testimony = (await db.query(
    'SELECT * FROM testimonies WHERE id = $1',
    [testimonyId]
  )).rows[0];
    
  if (testimony === undefined)
    return res.status(404).json({
      error: {
        message: 'Resource not found.'
      }
    });

  req.currentTestimonyObject = {
    testimonyId: testimony.id,
    dateReceived: formatDate(testimony.date_received),
    lengthOfStay: testimony.length_of_stay,
    gender: testimony.gender,
  };

  next();
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader === undefined)
    return res.status(401).json({
      error: {
        message: 'This endpoint requires an authorization token in the "Authorization" header.'
      }
    }); 

  const token = authHeader.split(' ')[1];
  if (token === undefined) 
    return res.status(401).json({
      error: {
        message: '"Authorization" header must be a string of the form "Bearer " followed by the authorization token.'
      }
    });
  
  let payload;
  try {
    payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Verification of authorization token failed.'
      }
    });
  }

  req.jwtPayload = payload;
  next();
}

class TestimonyValidationError extends Error {}

async function validateTestimonyWriteObject(req, res, next) {
  const data = req.body.data;

  try {
    if (
      [
        data.dateReceived,
        data.lengthOfStay,
        data.gender,
        data.divisions,
        data.transcription,
      ].every(property => property === undefined) 
    )
      throw new TestimonyValidationError(
        'At least one of these properties must be defined: \
        dateReceived, lengthOfStay, gender, divisions, transcription'
      );
  
    if (
      data.dateReceived &&
      !(/^\d{4}-\d{2}$/.test(data.dateReceived))
    )
      throw new TestimonyValidationError(
        '\'dateReceived\' property should be a string in the format \'YYYY-MM\'.'
      );
    
    if (
      data.lengthOfStay &&
      !(/^\d+$/.test(data.lengthOfStay))
    )
      throw new TestimonyValidationError(
        '\'lengthOfStay\' property should be an integer.'
      );
  
    if ( 
      data.gender &&
      !['Male', 'Female', 'Non-binary', 'Other'].includes(data.gender)
    )
      throw new TestimonyValidationError(
        '\'gender\' property should be one of \'Male\', \'Female\', \
        \'Non-binary\', or \'Other\''
      );
  
    if (data.divisions) {
      const validDivisions = (await db.query('SELECT name FROM divisions')).rows
        .map(row => row.name);
  
      const invalidDivisions = data.divisions.filter(div => !validDivisions.includes(div));
  
      if (invalidDivisions.length) 
        throw new TestimonyValidationError(
          '\'divisions\' property included one or more unrecognized \
          divisions:\n' + invalidDivisions.join('\n')
        );
    }
  
    if (data.transcription) {
      if (!data.transcription.length)
        throw new TestimonyValidationError(
          '\'transcription\' property must have at least one element.'
        );
  
      const validCategories = (await db.query('SELECT name FROM categories')).rows
        .map(row => row.name);
      
      for (const sentenceObject of data.transcription) {
        if (sentenceObject.text === undefined)
          throw new TestimonyValidationError(
            'All \'sentence\' objects in transcription must include a \
            \'.text\' property.'
          );
        
        if (
          sentenceObject.categories !== undefined &&
          sentenceObject.categories.length
        ) {
          const invalidCategories = sentenceObject.categories
            .filter(cat => !validCategories.includes(cat));
  
          if (invalidCategories.length)
            throw new TestimonyValidationError(
              '\'categories\' property for one sentence included the \
              following unrecognized categories:\n' + 
              invalidCategories.join('\n')
            );
        }
      }
    }
  } catch (error) {
    if (error instanceof TestimonyValidationError)
      return res.status(400).json({
        error: {
          message: error.message
        }
      });
    else
      throw error;
  }

  next();
}

async function verifyFileUploadContentType(req, res, next) {
  const acceptedMIMETypes = [
    'image/jpeg',
    'image/png',
    'application/pdf'
  ];

  if (!(acceptedMIMETypes.includes(req.headers['content-type'])))
    return res.status(400).json({
      error: {
        message: 'File format not supported: only .jpg/jpeg, .png or .pdf ' +
          'files are accepted'
      }
    });

  const fileType = await import('file-type');

  if (
    !(req.body instanceof Buffer) || 
    (await fileType.fileTypeFromBuffer(req.body)).mime !== req.headers['content-type']
  )
    return res.status(400).json({
      error: {
        message: 'Unable to verify uploaded file.'
      }
    });
    
  next();
}

module.exports = {
  verifyRequestBodyData,
  verifyLoginCredentials,
  verifyTestimonyId,
  authenticateToken,
  validateTestimonyWriteObject,
  verifyFileUploadContentType,
};