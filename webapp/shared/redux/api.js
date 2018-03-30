import { createLogic } from 'redux-logic';
import Config from 'config.js';

export const name = 'api';

const getState = state => state[name];

/*
 * TYPES
 */

const prefix = `${name}/`;

// const FETCH_CURRENT_USER = `${prefix}FETCH_CURRENT_USER`;

const  SET_IN_GAME = `${prefix}SET_IN_GAME`;
const  UNSET_IN_GAME = `${prefix}UNSET_IN_GAME`;

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

const setInGame = () => ({
  type: SET_IN_GAME,
});

const unsetInGame = () => ({
  type: UNSET_IN_GAME,
});

/*
 * REDUCER
 */

const initialState = {
  currentUser: {
    name: 'Pioncz',
    avatar: '',
    level: 1,
    id: 1,
  },
  inGame: false,
};

const reducer = (state = initialState, action) => {
  const actions = {
    // [FETCH_CURRENT_USER]: () => ({
    //   ...state,
    //   state: 'loading'
    // }),
    [SET_IN_GAME]: () => ({
      ...state,
      inGame: true,
    }),
    [UNSET_IN_GAME]: () => ({
      ...state,
      inGame: false,
    }),
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

const getCurrentUser = state => getState(state).currentUser;

const isInGame = state => getState(state).inGame;

/*
 * EXPORTS
 */

export default reducer;

export const actions = {
//  fetchCurrentUser,
  setInGame,
  unsetInGame,
};

export const types = {
//  FETCH_CURRENT_USER,
};

export const logic = {
//  fetchCurrentUserLogic,
};

export const selectors = {
  getCurrentUser: getCurrentUser,
  isInGame: isInGame,
};
