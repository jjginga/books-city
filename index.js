const express = require('express');
const app = express();
const winston = require('winston');
const config = require('config');

const dbPath = config.get('database');
const port = process.env.PORT || config.get('port');

require('./startup/logging')(dbPath);
require('./startup/cors')(app);
require('./startup/routes')(app);
require('./startup/database')(dbPath);
require('./startup/config')();
require('./startup/api')(app);
require('./startup/prod')(app);

const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
