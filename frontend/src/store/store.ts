import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './GameSlice';
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';

const store = configureStore({
  reducer: {
    game: gameReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> =
  useSelector;
