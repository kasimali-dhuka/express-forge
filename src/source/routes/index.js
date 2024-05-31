const express = require('express');
const apiRouter = require('./api.routes');
const webRouter = require('./web.routes');
const router = express.Router();

router.use('/api/v1', apiRouter);
router.use(webRouter);

module.exports = router;
