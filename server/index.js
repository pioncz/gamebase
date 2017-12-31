'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const https = require('https');
const fs = require('fs');
const git = require('git-rev');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
var cors = require('cors');
var io = require('socket.io')(http);

const Games = ['ludo'];

let queues = {};

io.on('connection', function(socket){
  socket.emit('console', 'hi user');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('console', function(msg){
    console.log('console: ' + msg);
  });
});

function handleError(req, res, error) {
  console.error(error.statusCode, error.error, error.options.uri);
  res.send(error.statusCode);
}

git.branch(function(branchName) {
  var configFile = './../config/develop.json'
  var config = require(configFile);
  var baseUrl = config.baseUrl;

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

  app.use('/ping', function(req, res) {
    console.log((new Date()).toISOString());
    res.send(200);
  });

  app.use('/', express.static('dist'));

  app.use(function (req, res) {
    var fileName = __dirname + '/../dist/index.html';
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
  http.listen(port, function(){
    console.log('Listening on *:' + port);
  });
});
