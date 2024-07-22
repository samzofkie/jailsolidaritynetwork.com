import crypto from 'crypto';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as mupdf from 'mupdf';


export function hashFunction(plaintext, salt) {
  return crypto.pbkdf2Sync(plaintext, salt, 10000, 64, 'sha3-512');
}

export async function newDBConnection() {
  const client = new pg.Client({
    user: 'postgres',
    host: 'db',
    database: 'jailsolidaritynetwork',
    password: 'xGfKqmOznGVrzHc40WY-Y',
  });
  await client.connect();
  return client;
}

export async function getSaltAndHashForUser(username) {
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

export async function authenticatePassword(req, res, next) {
  if (
    req.query.username && req.query.password &&
    await usernameAndPasswordCorrect(req.query.username, req.query.password)
  ) {
    next();
  } else {
    return res.status(403).send('Username and password invalid.');
  }
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) 
    return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, idk) => {
    if (err)
      return res.sendStatus(403);

    console.log(idk);

    next();
  });
}

export async function readAllRowsFromTable(table) {
  const client = await newDBConnection();
  const { rows } = await client.query(`SELECT * FROM ${table}`);
  await client.end();
  return rows;
}

export function extractPreviewImageFromPDF(pdf, previewPNGFilename) {
  const doc = mupdf.Document.openDocument(
    fs.readFileSync(pdf), 'application/pdf'
  );
  const page = doc.loadPage(0);
  const pixmap = page.toPixmap(mupdf.Matrix.identity, mupdf.ColorSpace.DeviceRGB, false, true);
  const pngImage = pixmap.asPNG();
  fs.writeFileSync(previewPNGFilename, Buffer.from(pngImage));
}