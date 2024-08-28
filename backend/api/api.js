const crypto = require('crypto');
const fs = require('fs');

const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const port = 8080;
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'jailsolidaritynetwork',
    password: 'xGfKqmOznGVrzHc40WY-Y',
});

function formatDate(dateString) {
  const date = new Date(dateString);
  let month = (date.getMonth() + 1).toString();
  if (month.length < 2) {
    month = '0' + month;
  }
  return `${date.getFullYear()}-${month}`;
}

function verifyRequestBodyData(req, res, next) {
  if (req.body.data === undefined)
    return res.status(400).json({
      error: {
        message: 'Request body must be a JSON object with a .data property \
        containing the data to be uploaded.'
      }
    });
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

  let testimony = (await pool.query(
    'SELECT * FROM testimonies WHERE id = $1',
    [testimonyId]
  )).rows[0];
    
  if (!testimony)
    return res.status(404).send('Resource not found.');

  req.currentTestimonyObject = {
    testimonyId: testimony.id,
    dateReceived: testimony.date_received,
    lengthOfStay: testimony.length_of_stay,
    gender: testimony.gender,
  };
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) 
    return res.sendStatus(401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res.sendStatus(401);
  }

  req.jwtPayload = payload;
  next();
}

class TestimonyValidationError extends Error {}

async function validateTestimonyWriteObject(data) {
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
    const validDivisions = (await pool.query('SELECT name FROM divisions')).rows
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

    const validCategories = (await pool.query('SELECT name FROM categories')).rows
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
}

// GET /categories
app.get('/categories', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM categories');
  return res.json({
    data: {
      items: rows,
    }
  });
});

// GET /divisions
app.get('/divisions', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM divisions');
  return res.json({
    data: {
      items: rows
    }
  });
});

// POST /auth
app.post(
  '/auth',
  verifyRequestBodyData,
  async (req, res) => {
    const { username, password } = req.body.data;

    if (/[^\S]+/.test(username) || !username || !password)
      return res.status(400).json({
        error: {
          message: 'Bad request syntax.'
        },
      });

    const { rows } = await pool.query(
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

    if (crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha3-512').equals(hash)) {
      const token = jwt.sign({name: 'admin'}, process.env.ACCESS_TOKEN_SECRET);
      return res.status(201).json({
        data: {
          token: token
        }
      });
    } else {
      return res.status(401).json(unauthorizedResponseBody);
    }
  }
);

// GET /testimonies
app.get('/testimonies', async (_, res) => {
  const client = await pool.connect();
  
  const { rows: testimonyDivisions } = await client.query(
    'SELECT testimony_divisions.testimony_id, divisions.name \
    FROM testimony_divisions \
    INNER JOIN divisions ON testimony_divisions.division_id = divisions.id'
  );
  const { rows: testimonySentences } = await client.query(
    'SELECT * FROM testimony_sentences'
  );
  const { rows: testimonySentencesCategories } = await client.query(
    'SELECT testimony_sentences_categories.sentence_id, categories.name \
    FROM testimony_sentences_categories \
    INNER JOIN categories \
    ON testimony_sentences_categories.category_id = categories.id'
  );
  const { rows: testimonyFiles } = await client.query(
    'SELECT testimony_id, file_name FROM testimony_files'
  );

  const testimonies = (await client.query('SELECT * FROM testimonies')).rows
    .map(testimony => ({
      testimonyId: testimony.id,
      dateReceived: formatDate(testimony.date_received),
      lengthOfStay: testimony.length_of_stay,
      gender: testimony.gender,
      divisions: testimonyDivisions
        .filter(td => td.testimony_id === testimony.id)
        .map(td => td.name),
      transcription: testimonySentences
        .filter(ts => ts.testimony_id === testimony.id)
        .map(ts => ({
          sentenceId: ts.id,
          text: ts.sentence,
          categories: testimonySentencesCategories
            .filter(tsc => tsc.sentence_id === ts.id)
            .map(tsc => tsc.name),
        })),
      files: testimonyFiles
        .filter(tf => tf.testimony_id === testimony.id)
        .map(tf => tf.file_name),
    }));

  client.release();

  return res.send(testimonies);
});


// POST /testimonies
app.post(
  '/testimonies',
  verifyRequestBodyData,
  authenticateToken,
  async (req, res) => {

    const data = req.body.data;

    try {
      await validateTestimonyWriteObject(data);
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
    
    // Insertion
    const client = await pool.connect();
    let testimonyId;

    try {
      await client.query('BEGIN');

      const testimoniesFields = [
        data.dateReceived,
        data.lengthOfStay,
        data.gender
      ];
  
      if (testimoniesFields.every(property => property === undefined)) {
        testimonyId = (await client.query(
          'INSERT INTO testimonies DEFAULT VALUES'
        )).rows[0].id;
      } else {
        let insertionCommand = 'INSERT INTO testimonies (';
        let insertionValues = [];
  
        if (data.dateReceived !== undefined) {
          insertionCommand += 'date_received, ';
          insertionValues.push(data.dateReceived + '-01');
        }
  
        if (data.lengthOfStay !== undefined) {
          insertionCommand += 'length_of_stay, ';
          insertionValues.push(data.lengthOfStay);
        }
  
        if (data.gender !== undefined) {
          insertionCommand += 'gender, ';
          insertionValues.push(data.gender);
        }
  
        insertionCommand = insertionCommand.slice(0, -2) + ') VALUES ('
          + testimoniesFields
            .filter(field => field !== undefined)
            .map((_, i) => '$' + (i + 1))
            .join(', ')
          + ') RETURNING id';
  
        testimonyId = (await client.query(
          insertionCommand,
          insertionValues
        )).rows[0].id;
      }

      if (data.divisions)
        for (const division of data.divisions)
          await client.query(
            'INSERT INTO testimony_divisions (testimony_id, division_id) \
            VALUES ($1, (SELECT id FROM divisions WHERE name = $2))',
            [testimonyId, division]
          );

      if (data.transcription)
        for (const sentenceObject of data.transcription) {
          console.log(sentenceObject);
          const sentenceId = (await client.query(
            `INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id`,
            [sentenceObject.text, testimonyId]
          )).rows[0].id;

          for (const category of sentenceObject.categories)
            await client.query(
              `INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))`,
              [sentenceId, category]
            );
        }
    
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    return res.status(200).json({
      data: {
        testimonyId: testimonyId
      }
    });
  }
);

// GET /testimonies/:testimonyId
app.get(
  '/testimonies/:testimonyId',
  verifyTestimonyId,
  async (req, res) => {
    const testimonyId = req.params.testimonyId;
    const testimony = req.currentTestimonyObject;

    const client = await pool.connect();

    testimony.divisions = (await client.query(
      'SELECT divisions.name FROM testimony_divisions \
      INNER JOIN divisions ON testimony_divisions.division_id = divisions.id \
      WHERE testimony_id = $1',
      [testimonyId]
    )).rows.map(row => row.name);

    const sentencesCategories = (await client.query(
      'SELECT sentence_id, categories.name AS category \
      FROM testimony_sentences_categories \
      INNER JOIN testimony_sentences \
      ON testimony_sentences_categories.sentence_id = testimony_sentences.id \
      INNER JOIN categories \
      ON testimony_sentences_categories.category_id = categories.id \
      WHERE testimony_id = $1',
      [testimonyId]
    )).rows;

    testimony.sentences = (await client.query(
      'SELECT id, sentence FROM testimony_sentences WHERE testimony_id = $1',
      [testimonyId]
    )).rows.map(sentence => ({
      sentenceId: sentence.id,
      text: sentence.sentence,
      categories: sentencesCategories
        .filter(sc => sentence.id === sc.sentence_id)
        .map(sc => sc.category)
    }));

    testimony.files = (await client.query(
      'SELECT file_name FROM testimony_files WHERE testimony_id = $1',
      [testimonyId]
    )).rows.map(row => row.file_name);

    client.release();

    return res.send(testimony);
  }
);

// PUT /testimonies/:testimonyId
app.put(
  '/testimonies/:id',
  verifyTestimonyId,
  authenticateToken,
  async (req, res) => {
    try {
      await validateTestimonyWriteObject(data);
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

    return res.status(200);
  }
);

// DELETE /testimonies/:id

// POST /testimonies/:id/files
app.post(
  '/testimonies/:id/files',
  authenticateToken,
  //upload.single('file'),
  express.raw({
    type: [
      'image/png',
    ]
  }),
  async (req, res) => {
    return;

    //console.log('here', req);
    //console.log(req.get('Content-Type'));

    /*console.log(typeof req.body);
    fs.writeFileSync('./test.png', req.body);

    const testimonyId = req.params.id;
    const file = req.file;
    
    if (!file)
      return res.status(400).send('File in body of request is undefined!')

    const newFileName = await testimonyFileManager.insertNewFile(testimonyId, file);

    if (!newFileName)
      return res.status(400).send(testimonyFileManager.errorMessage);
    else 
      return res.status(200).json({fileName: newFileName});*/
  }
);

// DELETE /testimonies/:id/file/:fileId

app.listen(port, () => console.log(`API listening on port ${port}`));
