import express from 'express';
import playerService from './player.service.js';

const router = express.Router();

// routes
router.post('/login', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);

export default router;

function authenticate(req, res, next) {
  playerService
    .authenticate(req.body)
    .then((player) =>
      player
        ? res.cookie('token', player.token).json({})
        : res
            .status(400)
            .json({ message: 'Email or password is incorrect' }),
    )
    .catch((err) => res.status(400).json({ error: err }));
}

function register(req, res, next) {
  playerService
    .create(req.body)
    .then((player) =>
      player
        ? res.cookie('token', player.token).json({})
        : res
            .status(400)
            .json({ message: 'Email or password is incorrect' }),
    )
    .catch((err) => res.status(400).json({ error: err }));
}

function getAll(req, res, next) {
  playerService
    .getAll()
    .then((players) => res.json(players))
    .catch((err) => next(err));
}

function getCurrent(req, res, next) {
  playerService
    .getById(req.player.sub)
    .then((player) =>
      player ? res.json(player) : res.sendStatus(404),
    )
    .catch((err) => next(err));
}

function getById(req, res, next) {
  playerService
    .getById(req.params.id)
    .then((player) =>
      player ? res.json(player) : res.sendStatus(404),
    )
    .catch((err) => next(err));
}

function update(req, res, next) {
  playerService
    .update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function _delete(req, res, next) {
  playerService
    .delete(req.params.id)
    .then(() => res.json({}))
    .catch((err) => next(err));
}
