fetch('/api/file/')
  .then(response => response.json())
  .then(data => console.log(data.platform, data.data));
