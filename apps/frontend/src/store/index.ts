import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import quizReducer from './slices/quizSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import socketReducer from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    leaderboard: leaderboardReducer,
    socket: socketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
