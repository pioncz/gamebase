import { createStore, applyMiddleware, compose, } from 'redux'
import { createLogicMiddleware, } from 'redux-logic'
import createApiClient from './services/api'
import rootReducer from './reducer'
import logic from './logic'

const preloadedState = window.__PRELOADED_STATE__;

delete window.__PRELOADED_STATE__;

export default function initStore() {
  const logicMiddleware = createLogicMiddleware(logic);
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(rootReducer, preloadedState, composeEnhancers(
    applyMiddleware(
      logicMiddleware,
    ),
  ));

  logicMiddleware.addDeps({ httpClient: createApiClient(store), });

  return store;
}
