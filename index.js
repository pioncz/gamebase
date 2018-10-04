'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const https = require('https');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const jwt = require('./server/jwt');
const errorHandler = require('./server/error-handler');
const playersController = require('./server/players/players.controller');

function handleError(req, res, error) {
  console.error(error.statusCode, error.error, error.options.uri);
  res.send(error.statusCode);
}

var config = require('./server/config');
const WebsocketServer = require('./server/ioConnector.js');
const websocketServer = new WebsocketServer(io, config);
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'gamebase';

MongoClient.connect(dbUrl, { useNewUrlParser: true } , function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to database server");

  const db = client.db(dbName);

  client.close();
});

/**
* Module variables
*/
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ inflate: false }));
app.use(cookieParser());
app.use(cors());
app.use(jwt());

app.use('/api/players/', playersController);

app.use('/ping', function(req, res) {
  console.log((new Date()).toISOString());
  res.send(200);
});

app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/static/', express.static(path.join(__dirname, 'static')));

app.use(function (req, res) {
  var fileName = __dirname + '/dist/index.html';
    fs.readFile(fileName, 'utf8', function (err,data) {
    if (err) {
      console.log(err);
      res.status(404).send({error: 'index not found', url: req.url});
    } else {
      res.send(data);
    }
  });
});

let port = config.server.port;
http.listen(port, '0.0.0.0', function(){
  console.log('Listening on *:' + port);
});
