const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.static('client'));

const platform = process.platform;

const filePath =
  platform === 'linux' ? '/var/lib/dpkg/status' : `${__dirname}\\status.real`;

app.get('/', (req, res) => {
  res.sendFile('./public/index.html', { root: __dirname });
});

app.get('/api/file/', (req, res) => {
  console.log(filePath);
  fs.readFile(filePath, 'utf8', (err, data) => {
    res.json({ platform, filePath, data });
  });
});

app.get('/*', (req, res) => {
  res.send(`<div>
    <h1>Not Found</h1>
    <a href="/">Go back</a>
  </div>`);
});

const PORT = process.env.PROT || 3005;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
