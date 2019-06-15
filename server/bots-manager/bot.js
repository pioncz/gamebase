const Player = require('./../Player.js');

let nextId = 1;

class Bot extends Player {
  constructor() {
    const id = 'bot ' + (nextId++);
    super({
      id,
      login: id,
      avatar: '/static/avatar1.jpg',
    });
    this.bot = true;
  }
  setGame(gameName) {

  }
}

module.exports=Bot;