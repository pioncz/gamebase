import { postLogin, postRegister } from '@/lib/api';
import { Dice, Player } from '@/lib/types';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { AppDispatch } from './store';

type GameState = {
  player: Player;
  registration: {
    loading: boolean;
    registered: boolean;
    error: boolean;
  };
  login: {
    loading: boolean;
    error: string | null;
  };
  inGame: boolean;
  dices: Dice[];
  games: string[];
};

export const selfSelect = ({ game }: { game: GameState }) => game;
export const getPlayer = createSelector(
  selfSelect,
  (state) => state.player,
);
export const isInGame = createSelector(
  selfSelect,
  (state) => state.inGame,
);

export const getDices = createSelector(
  selfSelect,
  (state) => state.dices,
);

export const getGames = createSelector(
  selfSelect,
  (state) => state.games,
);

export const gameSlice = createSlice({
  name: 'counter',
  initialState: {
    player: {
      id: '',
      state: 'loggedOut',
    },
    registration: {
      loading: false,
      registered: false,
      error: false,
    },
    login: {
      loading: false,
      error: null,
    },
    inGame: false,
    dices: [],
    games: [],
  } as GameState,
  reducers: {
    setInGame: (state, { payload }: { payload: boolean }) => {
      state.inGame = payload;
    },
    registerPlayer: (state) => {
      state.registration = {
        loading: true,
        registered: false,
        error: false,
      };
    },
    registerPlayerSuccess: (state) => {
      state.registration = {
        loading: false,
        registered: true,
        error: false,
      };
    },
    registerPlayerFail: (state) => {
      state.registration = {
        loading: false,
        registered: false,
        error: true,
      };
    },
    loginPlayer: (state) => {
      state.login.loading = true;
    },
    loginPlayerSuccess: (state) => {
      state.login.loading = false;
      state.login.error = null;
    },
    loginPlayerFail: (state) => {
      state.login.loading = false;
      state.login.error = 'Invalid email or password';
    },
    fetchCurrentPlayer: (state) => {
      state.player.state = 'loading';
    },
    fetchCurrentPlayerSuccess: (state) => {
      state.player.state = 'loggedIn';
    },
    fetchCurrentPlayerFail: (state) => {
      state.player.state = 'loggedOut';
    },
    logout: (state) => {
      state.player.state = 'loggedOut';
    },
    setPlayer: (state, { payload }) => {
      state.player = {
        ...state.player,
        ...payload,
      };
    },
    setGames: (state, { payload }: { payload: { games: [] } }) => {
      state.games = payload.games;
    },
    setDices: (state, { payload }: { payload: Dice[] }) => {
      state.dices = payload;
    },
  },
});

export const callLogin =
  (payload: { email: string; password: string }) =>
  (dispatch: AppDispatch) => {
    postLogin(payload).then(
      () => {
        dispatch(loginPlayerSuccess());
      },
      () => {
        dispatch(loginPlayerFail());
      },
    );
  };

export const callRegister =
  (payload: { email: string; login: string; password: string }) =>
  (dispatch: AppDispatch) => {
    postRegister(payload).then(
      () => {
        dispatch(registerPlayerSuccess());
      },
      () => {
        dispatch(registerPlayerFail());
      },
    );
  };

export const {
  setInGame,
  registerPlayer,
  registerPlayerFail,
  registerPlayerSuccess,
  loginPlayer,
  loginPlayerFail,
  loginPlayerSuccess,
  fetchCurrentPlayer,
  fetchCurrentPlayerFail,
  fetchCurrentPlayerSuccess,
  logout,
  setPlayer,
  setGames,
  setDices,
} = gameSlice.actions;

export default gameSlice.reducer;
