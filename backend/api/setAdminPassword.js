#!/usr/bin/node
import crypto from 'crypto';
import { hashFunction, newDBConnection } from './utils.js';

new Promise(async (res, _) => res(await newDBConnection()))
  .then(async client => {
    const password = process.argv.pop();
    console.log(password);
    const salt = crypto.randomBytes(20);
    const hash = hashFunction(password, salt);

    await client.query(
      `INSERT INTO users (name, salt, hash) VALUES ($1, $2, $3)`,
      ['admin', salt.toString('hex'), hash.toString('hex')]
    );
    
    await client.end();
});
