import { combineReducers, } from 'redux';
import api, { name as apiName, } from './shared/redux/api'

const reducer = combineReducers({
  [apiName]: api,
});

const initialState = {
};

function rootReducer(state = initialState, action) {
  return reducer(state, action);
}

export default rootReducer;
