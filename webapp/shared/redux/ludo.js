import { createLogic, } from 'redux-logic';

export const name = 'ludo';

const getState = state => state[name];

/*
 * TYPES
 */

const prefix = `${name}/`;

// const FETCH_CURRENT_USER = `${prefix}FETCH_CURRENT_USER`;

/*
 * ACTIONS
 */

// const fetchCurrentUser = options => ({
//   type: FETCH_CURRENT_USER,
//   payload: {
//     url: Config.baseUrl + '/api/v1/users/currentUser',
//     method: 'get',
//     ...options
//   },
// });

/*
 * REDUCER
 */

const initialState = {
  approxTime: '60',
  state: 'start', //start, queue, game, win, lost
  players: [
    {id: 1, name:'Player1', color:'red',},
  ],
  pawns: [
    {x:0, y:0, player: 1,},
    {x:1, y:0, player: 1,},
    {x:0, y:1, player: 1,},
    {x:1, y:1, player: 1,},
  ],
}

const reducer = (state = initialState, action) => {
  const actions = {
    // [FETCH_CURRENT_USER]: () => ({
    //   ...state,
    //   state: 'loading'
    // }),
  };

  return (actions[action.type] && actions[action.type]()) || state;
};

/*
 * LOGIC
 */

// const fetchCurrentUserLogic = createLogic({
//   type: [
//     FETCH_CURRENT_USER,
//     LOGIN_SUCCESS,
//   ],
//   cancelType: [ FETCH_CURRENT_USER_FAIL ],
//   latest: true,
//   process({ action: { payload }, httpClient, cancelled$ }) {
//     return httpClient.cancellable(payload, cancelled$)
//       .then(
//         response => { return fetchCurrentUserSuccess(response.data)},
//         fetchCurrentUserFail);
//   },
// });

/*
 * SELECTORS
 */

const getPawns = state => getState(state).pawns;

/*
 * EXPORTS
 */

export default reducer;

export const actions = {
//  fetchCurrentUser,
};

export const types = {
//  FETCH_CURRENT_USER,
};

export const logic = {
//  fetchCurrentUserLogic,
};

export const selectors = {
  getPawns,
};
