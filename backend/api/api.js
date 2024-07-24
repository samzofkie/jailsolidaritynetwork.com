/*import express from 'express';
import jwt from 'jsonwebtoken';
import { 
  newDBConnection, 
  authenticatePassword, 
  authenticateToken, 
  readAllRowsFromTable,
  parseTranscriptionText,
  testimonyInputsValid,
} from './utils.js';*/

const express = require('express');
const jwt = require('jsonwebtoken');
const {
  newDBConnection,
  authenticatePassword,
  authenticateToken,
  readAllRowsFromTable,
  parseTranscriptionText,
  testimonyInputsValid
} = require('./utils.js');

if (!process.env.ACCESS_TOKEN_SECRET) {
  console.error('ACCESS_TOKEN_SECRET env var not set! Exiting');
  process.exit(1);
}

async function sendNewAuthenticationToken(req, res) {
  const token = jwt.sign({name: 'admin'}, process.env.ACCESS_TOKEN_SECRET);
  res.json({accessToken: token});
}

async function listTestimonies(req, res) {
  const client = await newDBConnection();
  const { rows: categories } = await client.query('SELECT * FROM categories');
  const { rows: divisions } = await client.query('SELECT * FROM divisions');
  const { rows: testimonies } = await client.query('SELECT * FROM testimonies');
  const { rows: testimonyDivisions } = await client.query('SELECT * FROM testimony_divisions');
  const { rows: testimonySentences } = await client.query('SELECT * FROM testimony_sentences');
  const { rows: testimonySentecesCategories } = await client.query('SELECT * FROM testimony_sentences_categories');
  const { rows: testimonyFiles } = await client.query('SELECT * FROM testimony_files');
  await client.end();

  const divisionIdToNameMap = new Map(divisions.map(division => [division.id, division.name]));
  const categoryIdToNameMap = new Map(categories.map(category => [category.id, category.name]));
  
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
  
  res.send(testimonies);
}

function getSpecificTestimony(req, res) {

}

async function createNewTestimony(req, res) {
  // Add testimony to database
  let {dateReceived, lengthOfStay, gender, transcriptionText, divisions} = req.body;
  divisions = divisions.split(',').filter(d => d);
  const sentences = parseTranscriptionText(transcriptionText);
  const files = req.files;

  const client = await newConnectedClient();

  if (!(await testimonyInputsValid(
    {
      dateReceived: dateReceived,
      lengthOfStay: lengthOfStay,
      gender: gender,
      transcriptionText: transcriptionText,
      divisions: divisions,
    },
    client
  ))) {
    res.sendStatus(400);
    return;
  }

  console.log('Uploading new testimony...');
  
  let response = await client.query(
    'INSERT INTO testimonies (date_received, length_of_stay, gender) VALUES ($1, $2, $3) RETURNING id', 
    [dateReceived, lengthOfStay, gender]
  );
  const testimonyId = response.rows[0].id;

  for (let division of divisions) {
    const divisionId = validDivisions.find(vd => vd.name === division).id;
    await client.query(
      'INSERT INTO testimony_divisions (testimony_id, division_id) VALUES ($1, $2)',
      [testimonyId, divisionId]
    );
  }

  for (let sentence of sentences) {
    response = await client.query(
      'INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id',
      [sentence.text, testimonyId]
    );
    const sentenceId = response.rows[0].id;

    for (let tag of sentence.tags) {
      const categoryId = validCategories.find(vc => vc.shorthand === tag).id;
      await client.query(
        'INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, $2)',
        [sentenceId, categoryId]
      );
    }
  }

  let i = 0;
  for (let file of files) {
    const suffix = file.originalname.split('.')[1] ? '.' + file.originalname.split('.')[1] : '';
    const newFileName = `${testimonyId}-${i}` + suffix;
    fs.renameSync(file.destination + file.filename, file.destination + newFileName);

    await client.query(
      'INSERT INTO testimony_Files (testimony_id, file_name) VALUES ($1, $2)',
      [testimonyId, newFileName]
    );
    i++;
  }
    
  await client.end();

  res.send('Success');
}

function updateExistingTestimony(req, res) {

}

function deleteExistingTestimony(req, res) {

}

const app = express();
app.use(express.json())
const port = 8080;
app.get('/auth', authenticatePassword, sendNewAuthenticationToken);
['categories', 'divisions', 'genders'].map(identifier => app.get(
  '/' + identifier, 
  async (_, res) => res.json(await readAllRowsFromTable(identifier))));
app.get('/testimonies', listTestimonies);
app.get('/testimonies/:testimonyId', getSpecificTestimony);
app.post('/testimonies', authenticateToken, createNewTestimony);
app.put('/testimonies/:testimonyId', authenticateToken, updateExistingTestimony);
app.delete('/testimonies/:testimonyId', authenticateToken, deleteExistingTestimony);
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

//const adminHash = JSON.parse(fs.readFileSync('./.adminPassword'));
//adminHash.salt = Buffer.from(adminHash.salt);
//adminHash.hash = Buffer.from(adminHash.hash);
/*
function authenticate(password) {
  const challengerHash = crypto.pbkdf2Sync(password, adminHash.salt, adminHash.iterations, adminHash.hash.length, adminHash.digest);
  return challengerHash.equals(adminHash.hash);
}

async function newConnectedClient() {
  const client = new Client({
    user: 'postgres',
    host: 'db',
    database: 'jailsolidaritynetwork',
    password: 'xGfKqmOznGVrzHc40WY-Y',
  });
  await client.connect();
  return client;
}

app.post('/testimony', upload.array('files'), async (req, res) => {
  if (!req.body.password) {
    res.sendStatus(401);
    return;
  } else if (!authenticate(req.body.password)) {
    res.sendStatus(403);
    return;
  }

  let {dateRecieved, lengthOfStay, gender, transcriptionText, divisions} = req.body;
  divisions = divisions.split(',').filter(d => d);
  const sentences = transcriptionText*/
    //.match(/[^.?!]*[.?!]\S*/g)
    /*?.map((sentenceText) => sentenceText.trim())
    .map(sentence => {
      let [_text, punct, tags] = sentence.split(/([.!?])/);
      return {
        fullText: sentence,
        text: _text + punct,
        tags: tags.replace('<','').replace('>','').split(',').filter(tag => tag),
      };
    });
  let files = req.files;

  const client = await newConnectedClient();

  const validCategories = (await client.query('SELECT * FROM categories')).rows;
  const validDivisions = (await client.query('SELECT * FROM divisions')).rows;

  // Input validation
  for (let param of [
    {
      name: 'dateRecieved',
      value: dateRecieved,
      valid: () => /^\d{4}-\d{2}-\d{2}$/.test(dateRecieved),
    },
    {
      name: 'lengthOfStay',
      value: lengthOfStay,
      valid: () => /^\d+$/.test(lengthOfStay),
    },
    {
      name: 'divisions',
      value: divisions,
      valid: async () => {
        const validDivisionNames = validDivisions.map(row => row.name);
        return divisions.reduce(
          (acc, curr) => acc && validDivisionNames.includes(curr),
          true
        );
      }
    },
    {
      name: 'gender',
      value: gender,
      valid: async () => {
        const validGenders = (await client.query('SELECT * FROM genders'))
          .rows.map(row => row.name);
        return validGenders.includes(gender);
      }
    },
    {
      name: 'transcriptionText',
      value: transcriptionText.slice(0, 100) + 
        (transcriptionText.length > 100 ? '...' : ''),
      valid: async () => {
        const validShorthands = validCategories.map(row => row.shorthand);

        return sentences.reduce(
          (acc, sentence) => {
            const formValid = /^[^<]+(?:<[A-Z,]+>)?$/.test(sentence.fullText);
            const tagsValid = sentence.tags.reduce(
              (acc, shorthand) => acc && validShorthands.includes(shorthand),
              true
            );
            return acc && formValid && tagsValid;
          },
          true
        );
      },
    }
  ]) {
    if (!(await param.valid())) {
      console.error(`${param.name} invalid: ${param.value}`);
      res.sendStatus(400);
      return;
    }
  };

  console.log('Uploading new testimony...');
  
  let response = await client.query(
    'INSERT INTO testimonies (date_received, length_of_stay, gender) VALUES ($1, $2, $3) RETURNING id', 
    [dateRecieved, lengthOfStay, gender]
  );
  const testimonyId = response.rows[0].id;

  for (let division of divisions) {
    const divisionId = validDivisions.find(vd => vd.name === division).id;
    await client.query(
      'INSERT INTO testimony_divisions (testimony_id, division_id) VALUES ($1, $2)',
      [testimonyId, divisionId]
    );
  }

  for (let sentence of sentences) {
    response = await client.query(
      'INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id',
      [sentence.text, testimonyId]
    );
    const sentenceId = response.rows[0].id;

    for (let tag of sentence.tags) {
      const categoryId = validCategories.find(vc => vc.shorthand === tag).id;
      await client.query(
        'INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, $2)',
        [sentenceId, categoryId]
      );
    }
  }

  let i = 0;
  for (let file of files) {
    const suffix = file.originalname.split('.')[1] ? '.' + file.originalname.split('.')[1] : '';
    const newFileName = `${testimonyId}-${i}` + suffix;
    fs.renameSync(file.destination + file.filename, file.destination + newFileName);

    await client.query(
      'INSERT INTO testimony_Files (testimony_id, file_name) VALUES ($1, $2)',
      [testimonyId, newFileName]
    );
    i++;
  }
    
  await client.end();

  res.send('Success');
});


async function sendRowsFomDb(table, res) {
  const client = await newConnectedClient();
  const response = (await client.query(`SELECT * FROM ${table}`)).rows;
  res.json(response);
  await client.end();
}

app.get('/divisions', (_, res) => sendRowsFomDb('divisions', res))
app.get('/genders', (_, res) => sendRowsFomDb('genders', res))
app.get('/categories', (_, res) => sendRowsFomDb('categories', res))
*/