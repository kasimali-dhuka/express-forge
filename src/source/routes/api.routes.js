const express = require('express');
const apiRouter = express.Router();

apiRouter.get('/', async (req, res, next) => {
  // Your code

  return res.status(200).json({
    status: true,
    message: 'Data fetched',
    data: {}
  });
});

module.exports = apiRouter;
