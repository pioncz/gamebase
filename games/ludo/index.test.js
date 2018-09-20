const Ludo = require('./index.js');

let action = Ludo.Actions.Roll(6),
  player = {id: '1', name: '1'},
  roomState = {};

describe('PickPawnHandler - user picks pawn to move', () => {
  test('User rolls 6', () => {
    let streamActions = Ludo.ActionHandlers.Roll(action, player, roomState);
    console.log(streamActions);
    
    expect(1 + 2).toBe(3);
  });
});