const express = require('express');
const webRouter = express.Router();

webRouter.get('/', (req, res, next) => {
  return res.render('pages/welcome', { appName: process.env.APP_NAME });
});

module.exports = webRouter;
