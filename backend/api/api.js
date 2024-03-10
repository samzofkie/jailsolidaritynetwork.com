const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const port = 8080;

const adminHash = JSON.parse(fs.readFileSync('./.adminPassword'));
adminHash.salt = Buffer.from(adminHash.salt);
adminHash.hash = Buffer.from(adminHash.hash);

app.get('/upload', (req, res) => {
  if (!(req.query.hasOwnProperty('password'))) {
    res.sendStatus(401);
    return;
  }

  const challengerHash = crypto.pbkdf2Sync(req.query.password, adminHash.salt, adminHash.iterations, adminHash.hash.length, adminHash.digest);
    
  if (!challengerHash.equals(adminHash.hash)) {
    res.sendStatus(403);
    return;
  }

  res.send('Success');
});

app.get('/categories', async (req, res) => {
  const connection = await mysql.createConnection({
    host: 'db',
    user: 'root',
    password: 'samzofkie',
    database: 'jailsolidaritynetwork',
  });

  try {
    const [results, fields] = await connection.query(
      'SELECT * FROM categories;'
    );
    res.json(results.map(row => row.name));
  } catch(err) {
    console.error(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});