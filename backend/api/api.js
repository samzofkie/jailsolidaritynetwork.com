const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const { Client } = require('pg');

const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const app = express();
const port = 8080;

const adminHash = JSON.parse(fs.readFileSync('./.adminPassword'));
adminHash.salt = Buffer.from(adminHash.salt);
adminHash.hash = Buffer.from(adminHash.hash);

//const a = 'The Internet is a dangerous place! With great regularity, we hear about websites becoming unavailable due to denial of service attacks, or displaying modified (and often damaging) information on their homepages.<LS> In other high-profile cases, millions of passwords, email addresses, and credit card details have been leaked into the public domain, exposing website users to both personal embarrassment and financial risk.<LS,V> The purpose of website security is to prevent these (or any) sorts of attacks.<BSM> The more formal definition of website security is the act/practice of protecting websites from unauthorized access, use, modification, destruction, or disruption.<BSM,FW>'
  //.match(/[^.?!]*[.?!]\S*/g)
  //?.map((sentenceText) => sentenceText.trim());
/*for (let b of a) {
  let [c,d,e] = b.split(/([.?!])/);
  let f = e
    .split(',')
    .map(str => str.replace('<','').replace('>',''));
  console.log(f);
}*/

//console.log(a.match(/[^.?!]*[.?!]\S*/g)?.map((sentenceText) => sentenceText.trim()));

//process.exit(0);

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
  }
    
  if (!authenticate(req.body.password)) {
    res.sendStatus(403);
    return;
  }

  let {dateRecieved, lengthOfStay, gender, transcriptionText, divisions} = req.body;
  let files = req.files;

  // TODO: input validation

  const client = await newConnectedClient();
  let response = await client.query(
    'INSERT INTO testimonies (date_received, length_of_stay, gender) VALUES ($1, $2, $3) RETURNING id', 
    [dateRecieved, lengthOfStay, gender]
  );
  const testimonyId = response.rows[0].id;

  divisions = divisions.split(',').filter(s => s);

  for (let division of divisions) {
    response = await client.query("SELECT id FROM divisions WHERE name = $1", [division]);
    let divisionId = response.rows[0].id;

    await client.query(
      'INSERT INTO testimony_divisions (testimony_id, division_id) VALUES ($1, $2)',
      [testimonyId, divisionId]
    );
  }

  const sentences = transcriptionText
    .match(/[^.?!]*[.?!]\S*/g)
    ?.map((sentenceText) => sentenceText.trim());
  
  for (let sentence of sentences) {
    let [_text, punct, tags] = sentence.split(/([.!?])/);
    const text = _text + punct;

    response = await client.query(
      'INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id',
      [text, testimonyId]
    );
    const sentenceId = response.rows[0].id;


    if (tags) {
      tags = tags.split(',')
        .map(str => str.replace('<','').replace('>',''));;
      for (let tag of tags) {
        response = await client.query('SELECT id FROM categories WHERE shorthand = $1', [tag]);
        let categoryId = response.rows[0].id;
        await client.query(
          'INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, $2)',
          [sentenceId, categoryId]
        );
      }
    }
  }

  for (let file of files) {
    await client.query(
      'INSERT INTO testimony_Files (testimony_id, file_name) VALUES ($1, $2)',
      [testimonyId, file.filename]
    );
  }
    
  await client.end();

  res.send('Success');
});

app.get('/categories', async (req, res) => {
  const client = await newConnectedClient();
  const response = (await client.query('SELECT * FROM categories')).rows;
  res.json(response);
  await client.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});