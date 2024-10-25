#!/usr/bin/node
const crypto = require('crypto');
const { Client } = require('pg');


(async () => {
  const client = new Client({
    user: 'postgres',
    host: 'db',
    database: 'jailsolidaritynetwork',
    password: 'xGfKqmOznGVrzHc40WY-Y',
  });
  await client.connect();
  const password = process.argv.pop();
  const salt = crypto.randomBytes(20);
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha3-512');
  await client.query(
    `INSERT INTO users (name, salt, hash) VALUES ($1, $2, $3)`,
    ['admin', salt.toString('hex'), hash.toString('hex')]
  );
  await client.end();
})()
