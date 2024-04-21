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

app.post('/testimony', upload.array('files'), (req, res) => {
  if (!req.body.password) {
    res.sendStatus(401);
    return;
  }

  const challengerHash = crypto.pbkdf2Sync(req.body.password, adminHash.salt, adminHash.iterations, adminHash.hash.length, adminHash.digest);
    
  if (!challengerHash.equals(adminHash.hash)) {
    res.sendStatus(403);
    return;
  }

  //console.log(new Map(Object.entries(req.body)), req.files);

  res.send('Success');
});

app.get('/categories', async (req, res) => {
  const client = new Client({
    user: 'postgres',
    host: 'db',
    database: 'jailsolidaritynetwork',
    password: 'xGfKqmOznGVrzHc40WY-Y',
  });
  await client.connect();
  const response = (await client.query('SELECT * FROM categories')).rows;
  res.json(response);
  await client.end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});