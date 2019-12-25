const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());

const platform = process.platform;

const filePath =
  platform === 'linux' ? '/var/lib/dpkg/status' : `${__dirname}\\status.real`;

app.get('/', (req, res) => {
  console.log(`file path: ${filePath}`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    res.json({ platform, data });
  });
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
