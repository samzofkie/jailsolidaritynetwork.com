const express = require('express');

const crypto = require('crypto');
const fs = require('fs');

const app = express();
const port = 8080;

const adminSalt = fs.readFileSync('./.adminPassword/salt');
const adminIterations = parseInt(fs.readFileSync('./.adminPassword/iterations').toString());
const adminDigest = fs.readFileSync('./.adminPassword/digest').toString();
const adminHash = fs.readFileSync('./.adminPassword/hash');

app.get('/upload', (req, res) => {
  if (!(req.query.hasOwnProperty('password'))) {
    res.sendStatus(401);
  } else {
    const challengerHash = crypto.pbkdf2Sync(req.query.password, adminSalt, adminIterations, adminHash.length, adminDigest);
    if (challengerHash.equals(adminHash)) {
      res.send('Success!');
    } else {
      res.sendStatus(403);
    }
  };
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});