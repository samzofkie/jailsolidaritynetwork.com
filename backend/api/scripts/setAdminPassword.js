#!/usr/bin/node
const crypto = require('crypto');
const { DatabaseConnection } = require('./DatabaseConnection');

(async () => {
  const connection = new DatabaseConnection;
  const password = process.argv.pop();
  const salt = crypto.randomBytes(20);
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha3-512');
  await connection.query(
    `INSERT INTO users (name, salt, hash) VALUES ($1, $2, $3)`,
    ['admin', salt.toString('hex'), hash.toString('hex')]
  );
})()
