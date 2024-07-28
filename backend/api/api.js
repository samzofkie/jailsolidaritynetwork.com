const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { TestimonyUploadValidator } = require('./TestimonyUploadValidator');

const app = express();
const port = 8080;
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'jailsolidaritynetwork',
    password: 'xGfKqmOznGVrzHc40WY-Y',
});

const uploadValidator = new TestimonyUploadValidator(pool);

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
  if (!(await uploadValidator.validate(req.body)))
    return res.status(400).send(uploadValidator.errorMessage);

  // Format testimony upload data

  // Write testimony data to database
  
  res.send('Success');
});

app.listen(port, () => console.log(`API listening on port ${port}`));
