import { createLogic, } from 'redux-logic';

export const name = 'api';

const getState = state => state[name];

/*
 * TYPES
 */

const prefix = `${name}/`;

const SET_IN_GAME = `${prefix}SET_IN_GAME`;
const UNSET_IN_GAME = `${prefix}UNSET_IN_GAME`;
const REGISTER_PLAYER = `${prefix}REGISTER_PLAYER`;
const REGISTER_PLAYER_SUCCESS = `${prefix}REGISTER_PLAYER_SUCCESS`;
const REGISTER_PLAYER_FAIL = `${prefix}REGISTER_PLAYER_FAIL`;
const LOGIN_PLAYER = `${prefix}LOGIN_PLAYER`;
const LOGIN_PLAYER_SUCCESS = `${prefix}LOGIN_PLAYER_SUCCESS`;
const LOGIN_PLAYER_FAIL = `${prefix}LOGIN_PLAYER_FAIL`;
const FETCH_CURRENT_PLAYER = `${prefix}FETCH_CURRENT_PLAYER`;
const FETCH_CURRENT_PLAYER_SUCCESS = `${prefix}FETCH_CURRENT_PLAYER_SUCCESS`;
const FETCH_CURRENT_PLAYER_FAIL = `${prefix}FETCH_CURRENT_PLAYER_FAIL`;
const LOGOUT = `${prefix}LOGOUT`;
const SET_PLAYER = `${prefix}SET_PLAYER`;
const SET_DICES = `${prefix}SET_DICES`;
const SET_CURRENT_PLAYER_DICE = `${prefix}SET_CURRENT_PLAYER_DICE`;
const SET_CURRENT_PLAYER_LOGIN = `${prefix}SET_CURRENT_PLAYER_LOGIN`;
const SET_CURRENT_GAMES = `${prefix}SET_CURRENT_GAMES`;

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
    data: { ...payload, },
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
    data: { ...payload, },
  },
});

const loginPlayerSuccess = (response) => ({
  type: LOGIN_PLAYER_SUCCESS,
  payload: response.data,
});

const loginPlayerFail = (payload) => ({
  type: LOGIN_PLAYER_FAIL,
  payload,
});

const fetchCurrentPlayer = () => ({
  type: FETCH_CURRENT_PLAYER,
});

const fetchCurrentPlayerSuccess = (response) => ({
  type: FETCH_CURRENT_PLAYER_SUCCESS,
  payload: response.data,
});

const fetchCurrentPlayerFail = () => ({
  type: FETCH_CURRENT_PLAYER_FAIL,
});

const logout = () => ({
  type: LOGOUT,
  payload: {
    url: '/api/logout',
    method: 'get',
  },
});

const setCurrentPlayer = player => ({
  type: SET_PLAYER,
  payload: {
    player,
  },
});

const setCurrentDices = Dices => ({
  type: SET_DICES,
  payload: {
    Dices,
  },
});

const setCurrentPlayerDice = diceId => ({
  type: SET_CURRENT_PLAYER_DICE,
  payload: {
    diceId,
  },
});


const setCurrentPlayerLogin = login => ({
  type: SET_CURRENT_PLAYER_LOGIN,
  payload: {
    login,
  },
});

const setCurrentGames = games => ({
  type: SET_CURRENT_GAMES,
  payload: {
    games,
  },
});

/*
 * REDUCER
 */

const initialState = {
  player: {
    state: 'loggedOut',
  },
  registration: {
    loading: false,
    registered: false,
    error: false,
  },
  login: {
    loading: false,
    error: false,
  },
  inGame: false,
  Dices: [],
  games: [],
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
    [LOGIN_PLAYER]: () => ({
      ...state,
      login: {
        loading: true,
      },
    }),
    [LOGIN_PLAYER_SUCCESS]: () => ({
      ...state,
      login: {
        loading: false,
        error: null,
      },
    }),
    [LOGIN_PLAYER_FAIL]: () => ({
      ...state,
      login: {
        loading: false,
        error: 'Invalid email or password',
      },
    }),
    [FETCH_CURRENT_PLAYER]: () => ({
      ...state,
      player: {
        state: 'loading',
        ...action.payload,
      },
    }),
    [FETCH_CURRENT_PLAYER_SUCCESS]: () => ({
      ...state,
      player: {
        state: 'loggedIn',
        ...action.payload,
      },
    }),
    [FETCH_CURRENT_PLAYER_FAIL]: () => ({
      ...state,
      player: {
        state: 'loggedOut',
      },
    }),
    [LOGOUT]: () => ({
      ...state,
      player: {
        state: 'loggedOut',
      },
    }),
    [SET_PLAYER]: () => ({
      ...state,
      player: action.payload.player,
    }),
    [SET_DICES]: () => ({
      ...state,
      Dices: action.payload.Dices,
    }),
    [SET_CURRENT_PLAYER_DICE]: () => ({
      ...state,
      player: {
        ...state.player,
        diceId: action.payload.diceId,
      },
    }),
    [SET_CURRENT_PLAYER_LOGIN]: () => ({
      ...state,
      player: {
        ...state.player,
        login: action.payload.login,
      },
    }),
    [SET_CURRENT_GAMES]: () => ({
      ...state,
      games: action.payload.games,
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
  process({ action: { payload, }, httpClient, cancelled$, }) {
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
  process({ action: { payload, }, httpClient, cancelled$, }) {
    return httpClient.cancellable(payload, cancelled$)
      .then(
        loginPlayerSuccess,
        loginPlayerFail);
  },
});

const fetchCurrentPlayerLogic = createLogic({
  type: [
    REGISTER_PLAYER_SUCCESS,
    LOGIN_PLAYER_SUCCESS,
    FETCH_CURRENT_PLAYER,
  ],
  process({ httpClient, cancelled$, }) {
    return httpClient.cancellable({ url: '/api/currentPlayer',  method: 'get', }, cancelled$)
      .then(
        fetchCurrentPlayerSuccess,
        fetchCurrentPlayerFail);
  },
});

const logoutLogic = createLogic({
  type: [
    LOGOUT,
  ],
  process({ action: { payload, }, httpClient, cancelled$, }) {
    return httpClient.cancellable(payload, cancelled$);
  },
});


/*
 * SELECTORS
 */

const getCurrentPlayer = state => getState(state).player;

const isInGame = state => getState(state).inGame;

const getCurrentDices = state => getState(state).Dices;

const getCurrentGames = state => getState(state).games;

/*
 * EXPORTS
 */

export default reducer;

export const actions = {
  setInGame,
  unsetInGame,
  registerPlayer,
  loginPlayer,
  fetchCurrentPlayer,
  logout,
  setCurrentPlayer,
  setCurrentDices,
  setCurrentPlayerDice,
  setCurrentPlayerLogin,
  setCurrentGames,
};

export const logic = {
  registerPlayerLogic,
  loginPlayerLogic,
  fetchCurrentPlayerLogic,
  logoutLogic,
};

export const selectors = {
  getCurrentPlayer,
  isInGame,
  getCurrentDices,
  getCurrentGames,
};
