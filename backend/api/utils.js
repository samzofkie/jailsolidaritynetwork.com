const crypto = require('crypto');
const fs = require('fs');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const mupdf = import('mupdf');

function hashFunction(plaintext, salt) {
  return crypto.pbkdf2Sync(plaintext, salt, 10000, 64, 'sha3-512');
}

async function newDBConnection() {
  const client = new pg.Client({
    user: 'postgres',
    host: 'db',
    database: 'jailsolidaritynetwork',
    password: 'xGfKqmOznGVrzHc40WY-Y',
  });
  await client.connect();
  return client;
}

async function getSaltAndHashForUser(username) {
  const client = await newDBConnection();
  const { rows } = await client.query('SELECT * FROM users WHERE name = $1', [username]);
  await client.end();
  
  if (rows.length) {
    return { 
      salt: Buffer.from(rows[0].salt, 'hex'), 
      hash: Buffer.from(rows[0].hash, 'hex'),
    };
  } else {
    throw new Error('Query to \'users\' found nothing.');
  }
}

async function usernameAndPasswordCorrect(username, password) {
  try {
    const {salt, hash} = await getSaltAndHashForUser(username);
    return hashFunction(password, salt).equals(hash);
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function authenticatePassword(req, res, next) {
  if (
    req.query.username && req.query.password &&
    await usernameAndPasswordCorrect(req.query.username, req.query.password)
  ) {
    next();
  } else {
    return res.status(403).send('Username and password invalid.');
  }
}

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

async function readAllRowsFromTable(table) {
  const client = await newDBConnection();
  const { rows } = await client.query(`SELECT * FROM ${table}`);
  await client.end();
  return rows;
}

function extractPreviewImageFromPDF(pdf, previewPNGFilename) {
  const doc = mupdf.Document.openDocument(
    fs.readFileSync(pdf), 'application/pdf'
  );
  const page = doc.loadPage(0);
  const pixmap = page.toPixmap(mupdf.Matrix.identity, mupdf.ColorSpace.DeviceRGB, false, true);
  const pngImage = pixmap.asPNG();
  fs.writeFileSync(previewPNGFilename, Buffer.from(pngImage));
}

function parseTranscriptionText(text) {
  return text
    .match(/[^.?!]*[.?!]\S*/g)
    ?.map((sentenceText) => sentenceText.trim())
    .map(sentence => {
      let [_text, punct, tags] = sentence.split(/([.!?])/);
      return {
        fullText: sentence,
        text: _text + punct,
        tags: tags.replace('<','').replace('>','').split(',').filter(tag => tag),
      };
    });
}

async function testimonyInputsValid(inputs, client) {
  const {dateReceived, lengthOfStay, gender, transcriptionText, divisions, sentences} = inputs;

  const { rows: validCategories } = await client.query('SELECT * FROM categories');
  const { rows: validDivisions } = await client.query('SELECT * FROM divisions');
  const { rows: validGenders } = await client.query('SELECT * FROM genders');



  for (let param of [
    {
      name: 'dateReceeved',
      value: dateReceived,
      valid: () => /^\d{4}-\d{2}-\d{2}$/.test(dateReceived),
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
      return false;
    }
  };

  return true;

}

module.exports = {
  newDBConnection,
  authenticatePassword,
  authenticateToken,
  readAllRowsFromTable,
  parseTranscriptionText,
  testimonyInputsValid
};