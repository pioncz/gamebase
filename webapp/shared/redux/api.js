import { createLogic } from 'redux-logic';
import Config from 'config.js';

export const name = 'api';

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
  currentUser: {
    name: 'Pioncz',
    avatar: '',
    level: 1,
    id: 1,
  }
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

const getCurrentUser = state => getState(state).currentUser;

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
  getCurrentUser: getCurrentUser,
};
