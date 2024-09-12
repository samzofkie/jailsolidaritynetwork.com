const crypto = require('crypto');
const fs = require('fs');

const express = require('express');
const jwt = require('jsonwebtoken');

const db = require('./src/db.js');
const {
  verifyRequestBodyData,
  verifyTestimonyId,
  authenticateToken,
  validateTestimonyWriteObject,
} = require('./src/middleware.js');

const app = express();
app.use(express.json());

// GET /categories
app.get('/categories', async (_, res) => {
  const { rows } = await db.query('SELECT * FROM categories');
  return res.json({
    data: {
      items: rows,
    }
  });
});

// GET /divisions
app.get('/divisions', async (_, res) => {
  const { rows } = await db.query('SELECT * FROM divisions');
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
  const testimonies = await db.selectAllTestimonies();

  return res.send(testimonies);
});

// POST /testimonies
app.post(
  '/testimonies',
  authenticateToken,
  verifyRequestBodyData,
  validateTestimonyWriteObject,
  async (req, res) => {
    const data = req.body.data;
    const testimonyId = await db.insertTestimony(data);
    
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

    // This handler doesn't use a specialized db function (like something along
    // the lines of "selectTestimony(testimonyId)") because the 
    // verifyTestimonyId middleware function, in verifying the ID, queries the
    // testimonies table in the database, and caches the data from the returned
    // row in an object stored in req.currentTestimonyObject. So rather than
    // having a specialized function that just fetches the relevant divisions 
    // and sentences from the database, we just implement the rest of the 
    // querying here with a db.connect() client.

    const client = await db.connect();

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

    testimony.transcription = (await client.query(
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

    return res.status(200).json({
      data: testimony
    });
  }
);

// PUT /testimonies/:testimonyId
app.put(
  '/testimonies/:testimonyId',
  authenticateToken,
  verifyTestimonyId,
  verifyRequestBodyData,
  validateTestimonyWriteObject,
  async (req, res) => {
    const testimonyId = req.params.testimonyId;
    const data = req.body.data;

    await db.updateTestimony(testimonyId, data);

    return res.sendStatus(200);
  }
);

// DELETE /testimonies/:testimonyId

// POST /testimonies/:id/files
app.post(
  '/testimonies/:testimonyId/files',
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

// DELETE /testimonies/:testimonyId/file/:fileId

const port = 8080;
app.listen(port, () => console.log(`API listening on port ${port}`));
