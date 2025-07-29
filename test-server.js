const express = require('express');
const app = express();
const PORT = 8080; // Use the same port as your main server

app.get('/', (req, res) => {
  res.send('Hello from simple test server!');
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});