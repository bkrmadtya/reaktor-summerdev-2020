const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.static('public'));

const platform = process.platform;

const filePath =
  platform === 'linux' ? '/var/lib/dpkg/status' : `${__dirname}/status.real`;

app.get('/', (req, res) => {
  res.sendFile('./public/index.html', { root: __dirname });
});

app.get('/api/file/', (req, res) => {
  console.log(`file path: ${filePath}`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    res.send({ platform, data });
  });
});

app.get('/*', (req, res) => {
  res.send('<h1>Error 404</h1>');
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
