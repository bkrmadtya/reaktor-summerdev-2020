const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.static('client'));

const platform = process.platform;

console.log('[ENV]', process.platform);

const getFilePath = os =>
  os.toLowerCase().includes('linux')
    ? '/var/lib/dpkg/status'
    : `./client/status.real`;

app.get('/', (req, res) => {
  res.sendFile('./public/index.html', { root: __dirname });
});

app.get('/api/file', (req, res) => {
  let filePath = getFilePath(platform);
  console.log(filePath);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (!platform.toLowerCase().includes('linux')) {
      filePath = 'status.real (Sample file)';
    }
    res.json({ platform, filePath, data });
  });
});

app.get('/*', (req, res) => {
  res.send(`<div>
    <h1>Not Found</h1>
    <a href="/">Go back</a>
  </div>`);
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
