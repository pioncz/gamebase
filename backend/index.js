'use strict';
import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import { createServer } from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { Server } from 'socket.io';
import assert from 'assert';
import serverJwt from './jwt.js';
import errorHandler from './error-handler.js';
import playersController from './players/players.controller.js';
import playerService from './players/player.service.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import WebsocketServer from './websocket-server/index.js';
import config from './config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPassword = process.env.DB_PASSWORD || '';
const mongodb_uri = `mongodb+srv://luzeckipiotr:${dbPassword}@portfolio.bw5b6.mongodb.net/?retryWrites=true&w=majority&appName=Portfolio`;
const port = process.env.PORT || config.port;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const websocketServer = new WebsocketServer(io, playerService);

function handleError(req, res, error) {
  console.error(error.statusCode, error.error, error.options.uri);
  res.send(error.statusCode);
}

console.log(mongodb_uri);
// mongoose.set('useCreateIndex', true);
// mongoose
//   .connect(mongodb_uri, { useNewUrlParser: true }, (error) => {
//     console.error('Mongoose connection fail!');
//     error && console.error(error);
//   })
//   .then(
//     () => {
//       console.log('Mongoose connected!');
//     },
//     () => {
//       console.error('Mongoose connection fail!');
//     },
//   );
// mongoose.Promise = global.Promise;
const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
};
async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(mongodb_uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!',
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}
run().catch(console.dir);

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
app.use(serverJwt());

app.use('/api/players/', playersController);

app.use('/ping', function (req, res) {
  console.log(new Date().toISOString());
  res.send(200);
});

// app.use(
//   '/',
//   express.static(path.join(__dirname, '/../frontend/dist')),
// );
// app.use('/static/', express.static(path.join(__dirname, 'static')));

app.use('/api/currentPlayer', (req, res) => {
  const token = req.cookies.token,
    socketId = req.cookies.io,
    // player from websocketServer may be temporary
    tempPlayer =
      socketId &&
      websocketServer.connections[socketId] &&
      websocketServer.players[
        websocketServer.connections[socketId].playerId
      ];

  if (!token) {
    if (tempPlayer) {
      res.status(200).send(tempPlayer);
    } else {
      res.status(400).send({ error: 'Unauthorized' });
    }
    return;
  }

  playerService
    .verify({ token })
    .then((playerId) => {
      playerService.getById(playerId).then(
        (player) => {
          res.status(200).send(player);
        },
        (e) => {
          if (tempPlayer) {
            res.status(200).send(tempPlayer);
          } else {
            res.status(400).send({ error: 'Unauthorized' });
          }
        },
      );
    })
    .catch((e) => {
      if (tempPlayer) {
        res.status(200).send(tempPlayer);
      } else {
        res.status(400).send({ error: 'Unauthorized' });
      }
    });
});

app.use('/api/logout', (req, res) => {
  delete req.user;
  res.cookie('token', '').status(200).send({});
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.cookie('token', '').status(401).send('invalid token...');
  } else {
    next();
  }
});

app.use(function (req, res) {
  res.send({ hello: 'world' });
});

server.listen(port, () => {
  console.log('server running at http://localhost:' + port);
});
