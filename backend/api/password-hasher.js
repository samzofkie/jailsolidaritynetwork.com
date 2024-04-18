#!/usr/bin/node
const crypto = require('crypto');
const fs = require('fs');

const password = process.argv.pop();
const hash = {
    'salt': crypto.randomBytes(20),
    'iterations': 10000,
    'digest': 'sha3-512',
};
hash.hash = crypto.pbkdf2Sync(password, hash.salt, hash.iterations, 64, hash.digest);

fs.writeFileSync('.adminPassword', JSON.stringify(hash));
