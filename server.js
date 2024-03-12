const express = require('express');
const bodyParser = require('body-parser');
const handleRoutes = require('./routes/index');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

handleRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
