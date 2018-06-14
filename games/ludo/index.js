const ActionTypes = {
  SelectColor: 'SELECT_COLOR',
};

const SelectColor = (color) => {
  return {type: ActionTypes.SelectColor, value: color};
};

const Ludo = {
  Name: 'Ludo',
  Actions: {
    SelectColor,
  },
  ActionTypes,
};

module.exports = Ludo;