export const nextId = (() => {
  let id = 0;
  return () => {
    return (id++) + '';
  };
})();
  
export const randomColor = (format: 'hex' | 'rgb') => {
  const rint = Math.round(0xffffff * Math.random());
  switch (format) {
    case 'hex':
      return ('#0' + rint.toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');

    case 'rgb':
      return 'rgb(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ')';

    default:
      return rint;
  }
};

export const log = (msg: string) => console.error(msg);

export const updateObjectInArray = (array: { id: string }[], action: { id: string, item: object}) => array.map((item) => ({
  ...item,...(item.id === action.id ? action.item : {}),
}));
  
export const randomPlayer = () => {
  const id = nextId() + 'playerId';

  return {
    id,
    color: randomColor('rgb'),
    avatar: '/static/avatar6.jpg',
    login: 'Name ' + id,
    index: null,
  }
};
export const PawnSets: Record<string, Record<string, { id: string; x: number; z: number}[]>> = {
    Ludo: {
      'initial': [
        {id: '12', x: 0, z: 0,}, // first player
        {id: '13', x: 1, z: 0,}, // first player
        {id: '14', x: 0, z: 1,}, // first player
        {id: '15', x: 1, z: 1,}, // first player
        {id: '4', x: 9, z: 0,}, // second player
        {id: '5', x: 10, z: 0,}, // second player
        {id: '6', x: 9, z: 1,}, // second player
        {id: '7', x: 10, z: 1,}, // second player
        {id: '0', x: 9, z: 10,}, // third player
        {id: '1', x: 10, z: 10,}, // third player
        {id: '2', x: 9, z: 9,}, // third player
        {id: '3', x: 10, z: 9,}, // third player
        {id: '8', x: 0, z: 9,}, // fourth player
        {id: '9', x: 1, z: 9,}, // fourth player
        {id: '10', x: 0, z: 10,}, // fourth player
        {id: '11', x: 1, z: 10,}, // fourth player
      ],
      'movePawnBack': [
        {id: '12', x: 0, z: 4,}, // first player
        {id: '13', x: 1, z: 0,}, // first player
        {id: '14', x: 0, z: 1,}, // first player
        {id: '15', x: 1, z: 1,}, // first player
        {id: '4', x: 1, z: 4,}, // second player
        {id: '5', x: 4, z: 4,}, // second player
        {id: '6', x: 3, z: 4,}, // second player
        {id: '7', x: 2, z: 4,}, // second player
        {id: '0', x: 9, z: 10,}, // third player
        {id: '1', x: 10, z: 10,}, // third player
        {id: '2', x: 9, z: 9,}, // third player
        {id: '3', x: 10, z: 9,}, // third player
        {id: '8', x: 0, z: 9,}, // fourth player
        {id: '9', x: 1, z: 9,},
        {id: '10', x: 0, z: 10,},
        {id: '11', x: 1, z: 10,},
      ],
      'win': [
        {id: '12', x: 0, z: 5,}, // first player
        {id: '13', x: 2, z: 5,}, // first player
        {id: '14', x: 3, z: 5,}, // first player
        {id: '15', x: 4, z: 5,}, // first player
        {id: '4', x: 9, z: 0,}, // second player
        {id: '5', x: 10, z: 0,}, // second player
        {id: '6', x: 9, z: 1,}, // second player
        {id: '7', x: 10, z: 1,}, // second player
        {id: '0', x: 9, z: 10,}, // third player
        {id: '1', x: 10, z: 10,}, // third player
        {id: '2', x: 9, z: 9,}, // third player
        {id: '3', x: 10, z: 9,}, // third player
        {id: '8', x: 0, z: 9,}, // fourth player
        {id: '9', x: 1, z: 9,},
        {id: '10', x: 0, z: 10,},
        {id: '11', x: 1, z: 10,},
      ],
    },
    Ludo2: {
      'initial': [
        {id: '4', x: 1, z: 9,}, // first player
        {id: '12', x: 1, z: 1,}, // second player
        {id: '0', x: 9, z: 1,}, // third player
        {id: '8', x: 9, z: 9,}, // fourth player
      ],
    },
    Kira: {
      'initial': [
        {id: '12', x: 0.5, z: 0.5,}, // first player
        {id: '0', x: 0.5, z: 0.5,}, // third player
        {id: '8', x: 0.5, z: 0.5,}, // fourth player
        {id: '4', x: 0.5, z: 0.5,}, // second player
      ],
    },
  };