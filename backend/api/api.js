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
const upload = multer({ dest: 'files/' });

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

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, name) => {
    if (err)
      return res.sendStatus(403);
    req.name = name;
    next();
  });
}

// GET /categories
app.get('/categories', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM categories');
  return res.json(rows);
});

// GET /divisions
app.get('/divisions', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM divisions');
  return res.json(rows);
});

// POST /auth
app.post('/auth', async (req, res) => {
  const { username, password } = req.body;

  // Validate username
  if (/[^\S]+/.test(username))
    return res.status(400).send('Value passed for \'username\' ill-formed!');

  const { rows } = await pool.query(
    'SELECT * FROM users WHERE name = $1', 
    [username]
  );

  const unauthorizedMessage = 'Username and or password incorrect!'

  if (!rows.length) 
    return res.status(401).send(unauthorizedMessage);

  const salt = Buffer.from(rows[0].salt, 'hex'),
        hash = Buffer.from(rows[0].hash, 'hex');

  if (crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha3-512').equals(hash)) {
    const token = jwt.sign({name: 'admin'}, process.env.ACCESS_TOKEN_SECRET);
    return res.json({accessToken: token});
  } else {
    return res.status(401).send(unauthorizedMessage);
  }
});

// GET /testimonies
app.get('/testimonies', async (_, res) => {
  const client = await pool.connect();
  const { rows: categories } = await client.query('SELECT * FROM categories');
  const { rows: divisions } = await client.query('SELECT * FROM divisions');
  const { rows: testimonies } = await client.query('SELECT * FROM testimonies');
  const { rows: testimonyDivisions } = await client.query('SELECT * FROM testimony_divisions');
  const { rows: testimonySentences } = await client.query('SELECT * FROM testimony_sentences');
  const { rows: testimonySentecesCategories } = await client.query('SELECT * FROM testimony_sentences_categories');
  const { rows: testimonyFiles } = await client.query('SELECT * FROM testimony_files');
  client.release();

  const divisionIdToNameMap = new Map(divisions.map(division => [division.id, division.name]));
  const categoryIdToNameMap = new Map(categories.map(category => [category.id, category.name]));
  
  // Populate 'divisions' and 'sentences' properties for each testimony
  testimonies.map(testimony => {
    testimony.divisions = testimonyDivisions
      .filter(division => division.testimony_id === testimony.id)
      .map(division => divisionIdToNameMap.get(division.division_id));
    testimony.sentences = testimonySentences
      .filter(sentence => sentence.testimony_id === testimony.id)
      .map(s => ({id : s.id, sentence: s.sentence }));
    
    // Add categories to each sentence
    testimony.sentences.map(sentence => {
      const sentenceCategories = testimonySentecesCategories
        .filter(category => category.sentence_id === sentence.id)
        .map(c => categoryIdToNameMap.get(c.id));
      sentence.categories = sentenceCategories;
    });

    testimony.files = testimonyFiles
      .filter(file => file.testimony_id === testimony.id)
      .map(file => file.file_name);
  });
  
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
});

// GET /testimonies/:id

// PUT /testimonies/:id

// DELETE /testimonies/:id

// POST /testimonies/:id/files
app.post(
  '/testimonies/:id/files',
  authenticateToken,
  upload.single('file'),
  async (req, res) => {

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
