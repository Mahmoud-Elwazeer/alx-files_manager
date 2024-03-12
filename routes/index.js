const AppController = require('../controllers/AppController');

const handleRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
};

module.exports = handleRoutes;
