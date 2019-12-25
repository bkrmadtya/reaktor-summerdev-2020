const express = require('express');
const fs = require('fs');
const app = express();

const platform = process.platform;

app.get('/', (req, res) => {
  res.json({ platform });
  //   res.send('Moikka Maailmaa');
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
