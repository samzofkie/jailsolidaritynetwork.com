const express = require('express');
const app = express();
const fs = require('node:fs');
const { execSync } = require('node:child_process');
const process = require('node:process');

const port = 3000;

let narrativesDirContents = fs.readdirSync('public/narratives');
let narratives = {};

process.chdir('public/narratives');
for (let fileName of narrativesDirContents.filter(fileName => fileName.slice(-4) === '.zip')) { 
  
  let stem = fileName.slice(0, -4);
  
  if (! (narrativesDirContents.includes(stem + '.mp3') && 
         narrativesDirContents.includes(stem + '.txt'))) {
    console.log(`unzipping ${fileName}`);
    execSync(`unzip -o ${fileName}`);
  }
  let text = fs.readFileSync(stem + '.txt', {'encoding': 'utf8'});
  text = text.split(/\d{2}:\d{2}\n/);
  narratives[stem] = text; 
}
process.chdir('../..');




app.use(express.static('public'));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index', {narratives: narratives});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
