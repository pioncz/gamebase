import { combineReducers } from 'redux';
import api, { name as apiName } from './shared/redux/api'
import ludo, { name as ludoName } from './shared/redux/ludo'

const reducer = combineReducers({
  [apiName]: api,
  [ludoName]: ludo,
});

const initialState = {
};

function rootReducer(state = initialState, action) {
  return reducer(state, action);
}

export default rootReducer;
