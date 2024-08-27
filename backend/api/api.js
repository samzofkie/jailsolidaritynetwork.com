const crypto = require('crypto');
const fs = require('fs');

const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Pool } = require('pg');

const { Testimony } = require('./Testimony');
const { TestimonyFileManager } = require('./TestimonyFileManager');

const app = express();
const port = 8080;
app.use(express.json());
const upload = multer({ dest: 'documents/' });

const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'jailsolidaritynetwork',
    password: 'xGfKqmOznGVrzHc40WY-Y',
});

const testimonyFileManager = new TestimonyFileManager(pool);

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
app.post('/auth', async (req, res) => {
  const { username, password } = req.body;

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
});

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

  const formatDate = dateString => {
    const date = new Date(dateString);
    let month = (date.getMonth() + 1).toString();
    if (month.length < 2) {
      month = '0' + month;
    }
    return `${month}-${date.getFullYear()}`;
  }

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
  authenticateToken,
  async (req, res) => {
    const testimony = new Testimony(req.body, pool);
    
    if (!(await testimony.validate()))
      return res.status(400).send(testimony.errorMessage);

    const id = await testimony.insertIntoDatabase();
    
    return res.status(200).json({id: id});
  }
);

// GET /testimonies/:id
app.get('/testimonies/:id', async (req, res) => {
  const testimonyId = req.params.id;
  const client = await pool.connect();

  const testimony = (await client.query(
    'SELECT * FROM testimonies WHERE id = $1',
    [testimonyId]
  )).rows[0];
  
  if (!testimony) {
    return res.status(404).send('\'id\' value not found!');
  }

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
  )).rows.map(sentence => {

    return {
      ...sentence,
      categories: sentencesCategories
        .filter(sc => sentence.id === sc.sentence_id)
        .map(sc => sc.category)
    }
  });

  testimony.files = (await client.query(
    'SELECT file_name FROM testimony_files WHERE testimony_id = $1',
    [testimonyId]
  )).rows.map(row => row.file_name);

  return res.send(testimony);
});

// PUT /testimonies/:id
app.put(
  '/testimonies/:id',
  authenticateToken,
  async (req, res) => {
    const testimony = new Testimony(req.body);
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

    //console.log('here', req);
    //console.log(req.get('Content-Type'));

    console.log(typeof req.body);
    fs.writeFileSync('./test.png', req.body);

    const testimonyId = req.params.id;
    const file = req.file;
    
    if (!file)
      return res.status(400).send('File in body of request is undefined!')

    const newFileName = await testimonyFileManager.insertNewFile(testimonyId, file);

    if (!newFileName)
      return res.status(400).send(testimonyFileManager.errorMessage);
    else 
      return res.status(200).json({fileName: newFileName});
  }
);

// PUT /testimonies/:id/files/:fileId

// DELETE /testimonies/:id/file/:fileId

app.listen(port, () => console.log(`API listening on port ${port}`));
