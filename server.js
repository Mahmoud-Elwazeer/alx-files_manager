const express = require('express');
const handleRoutes = require('./routes/index');

const app = express();
const PORT = 5000;

handleRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
