const express = require('express');
const handleRoutes = require('./routes/index');

const app = express();
const PORT = 5000;

app.use(express.json());

handleRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
