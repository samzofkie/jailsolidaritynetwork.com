#!/usr/local/bin/node
const crypto = require('crypto');
const fs = require('fs');

const password = process.argv.pop();
const salt = crypto.randomBytes(20);
const iterations = 10000;
const digest = 'sha3-512';
const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, digest);

fs.writeFileSync('./.adminPassword/salt', salt);
fs.writeFileSync('./.adminPassword/iterations', iterations.toString());
fs.writeFileSync('./.adminPassword/digest', digest);
fs.writeFileSync('./.adminPassword/hash', hash);