const ActionTypes = {
  SelectColor: 'SelectColor',
  SelectedColor: 'SelectedColor',
  StartGame: 'StartGame',
};

const SelectColor = (color) => {
  return {type: ActionTypes.SelectColor, value: color};
};

const StartGame = (roomState) => {
  return {type: ActionTypes.StartGame, roomState: roomState};
};

const Config = {
  MinPlayer: 1,
};

const SelectColorHandler = (action, player, roomState) => {
  // console.log(action, player, roomState);
  let playerColor = roomState.playerColors.find(playerColor => {
    return playerColor.playerId === player.id;
  }),
    valueColor = roomState.playerColors.find(playerColor => {
      return playerColor.color === action.value;
    });
  
  if (playerColor) {
    console.log('player already has a color');
    return;
  }
  
  if (valueColor) {
    console.log('this color is already taken');
    return;
  }
  
  roomState.playerColors.push({playerId: player.id, color: action.value});
  
  return {type: ActionTypes.SelectedColor, value: action.value};
};

const Ludo = {
  Name: 'Ludo',
  Config,
  Actions: {
    SelectColor,
  },
  ActionHandlers: {
    SelectColor: SelectColorHandler,
    StartGame: StartGame,
  },
  ActionTypes,
};

module.exports = Ludo;