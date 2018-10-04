import { createLogic } from 'redux-logic';
import Config from 'config.js';

export const name = 'api';

const getState = state => state[name];

/*
 * TYPES
 */

const prefix = `${name}/`;

const  SET_IN_GAME = `${prefix}SET_IN_GAME`;
const  UNSET_IN_GAME = `${prefix}UNSET_IN_GAME`;
const  REGISTER_PLAYER = `${prefix}REGISTER_PLAYER`;
const  REGISTER_PLAYER_SUCCESS = `${prefix}REGISTER_PLAYER_SUCCESS`;
const  REGISTER_PLAYER_FAIL = `${prefix}REGISTER_PLAYER_FAIL`;
const  LOGIN_PLAYER = `${prefix}LOGIN_PLAYER`;
const  LOGIN_PLAYER_SUCCESS = `${prefix}LOGIN_PLAYER_SUCCESS`;
const  LOGIN_PLAYER_FAIL = `${prefix}LOGIN_PLAYER_FAIL`;

/*
 * ACTIONS
 */

const setInGame = () => ({
  type: SET_IN_GAME,
});

const unsetInGame = () => ({
  type: UNSET_IN_GAME,
});

const registerPlayer = (payload) => ({
  type: REGISTER_PLAYER,
  payload: {
    url: '/api/players/register',
    method: 'post',
    data: { ...payload },
  },
});

const registerPlayerSuccess = (payload) => ({
  type: REGISTER_PLAYER_SUCCESS,
  payload,
});

const registerPlayerFail = (payload) => ({
  type: REGISTER_PLAYER_FAIL,
  payload,
});

const loginPlayer = (payload) => ({
  type: LOGIN_PLAYER,
  payload: {
    url: '/api/players/login',
    method: 'post',
    data: { ...payload },
  },
});

const loginPlayerSuccess = (payload) => ({
  type: LOGIN_PLAYER_SUCCESS,
  payload,
});

const loginPlayerFail = (payload) => ({
  type: LOGIN_PLAYER_FAIL,
  payload,
});

/*
 * REDUCER
 */

const initialState = {
  profile: {
    state: 'loggedOut',
  },
  registration: {
    loading: false,
    registered: false,
    error: false,
  },
  inGame: false,
};

const reducer = (state = initialState, action) => {
  const actions = {
    [SET_IN_GAME]: () => ({
      ...state,
      inGame: true,
    }),
    [UNSET_IN_GAME]: () => ({
      ...state,
      inGame: false,
    }),
    [REGISTER_PLAYER]: () => ({
      ...state,
      registration: {
        loading: true,
        registered: false,
        error: false,
      },
    }),
    [REGISTER_PLAYER_SUCCESS]: () => ({
      ...state,
      registration: {
        loading: false,
        registered: true,
        error: false,
      },
    }),
    [REGISTER_PLAYER_FAIL]: () => ({
      ...state,
      registration: {
        loading: false,
        registered: false,
        error: action.payload,
      },
    }),
  };

  return (actions[action.type] && actions[action.type]()) || state;
};

/*
 * LOGIC
 */

const registerPlayerLogic = createLogic({
  type: [
    REGISTER_PLAYER,
  ],
  process({ action: { payload }, httpClient, cancelled$ }) {
    return httpClient.cancellable(payload, cancelled$)
      .then(
        registerPlayerSuccess,
        registerPlayerFail);
  },
});

const loginPlayerLogic = createLogic({
  type: [
    LOGIN_PLAYER,
  ],
  process({ action: { payload }, httpClient, cancelled$ }) {
    return httpClient.cancellable(payload, cancelled$)
      .then(
        loginPlayerSuccess,
        loginPlayerFail);
  },
});

/*
 * SELECTORS
 */

const getCurrentProfile = state => getState(state).profile;

const isInGame = state => getState(state).inGame;

/*
 * EXPORTS
 */

export default reducer;

export const actions = {
//  fetchCurrentUser,
  setInGame,
  unsetInGame,
  registerPlayer,
  loginPlayer,
};

export const logic = {
  registerPlayerLogic,
  loginPlayerLogic,
};

export const selectors = {
  getCurrentProfile,
  isInGame,
};
