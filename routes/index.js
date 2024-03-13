const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

const handleRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/users/me', UsersController.getMe);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.post('/files', FilesController.postUpload);
  app.get('/files', FilesController.getIndex);
  app.get('/files/:id', FilesController.getShow);
};

module.exports = handleRoutes;
