const express = require('express');
const app = express();
const port = 8080;

app.get('/upload', (req, res) => {
  console.log(req);
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});