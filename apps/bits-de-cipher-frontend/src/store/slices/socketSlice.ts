import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Dispatch } from '@reduxjs/toolkit';
import type { Socket } from 'socket.io-client';
import socketManager from '../../lib/socket';
import { setInitialData, setError as setQuizError, setDisconnected, updateQuestionPoints } from './quizSlice';
import {setTopLeaderboard,setAllLeaderboard,handleLeaderboardUpdate,setError as setLeaderboardError,setStatus as setLeaderboardStatus,} from './leaderboardSlice';
import type { RootState} from '..';

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastDisconnectReason: string | null;
}

const initialState: SocketState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  lastDisconnectReason: null,
};

let handlersRegistered = false;
const registeredHandlers = new Map<string, (...args: any[]) => void>();

const bindHandler = (socket: Socket, event: string, handler: (...args: any[]) => void) => {
  registeredHandlers.set(event, handler);
  socket.on(event, handler);
};

const clearHandlers = (socket?: Socket | null) => {
  if (!socket) return;
  registeredHandlers.forEach((handler, event) => {
    socket.off(event, handler);
  });
  registeredHandlers.clear();
  handlersRegistered = false;
};

const setupSocketListeners = (socket: Socket, dispatch: Dispatch) => {
  if (handlersRegistered) return;

  bindHandler(socket, 'connect', () => {
    dispatch(socketSlice.actions.socketConnected());
  });

  bindHandler(socket, 'disconnect', (reason: string) => {
    dispatch(socketSlice.actions.socketDisconnected(reason));
    dispatch(setDisconnected());
  });

  bindHandler(socket, 'connect_error', (error: Error) => {
    dispatch(socketSlice.actions.socketError(error.message));
  });

  bindHandler(socket, 'initialData', (payload) => {
    dispatch(setInitialData(payload));
    dispatch(setTopLeaderboard(payload.leaderboard));
    dispatch(setLeaderboardStatus('success'));
  });

  bindHandler(socket, 'leaderboardData', (payload) => {
    dispatch(setTopLeaderboard(payload.leaderboard));
    dispatch(setLeaderboardStatus('success'));
  });

  bindHandler(socket, 'allLeaderboardData', (payload) => {
    dispatch(setAllLeaderboard(payload.leaderboard));
    dispatch(setLeaderboardStatus('success'));
  });

  bindHandler(socket, 'leaderboard:update', (payload) => {
    dispatch(handleLeaderboardUpdate(payload));
  });

  bindHandler(socket, 'question:pointsUpdate', (payload: { questionId: number; points: number }) => {
    dispatch(updateQuestionPoints(payload));
  });

  bindHandler(socket, 'error', (payload: { message: string }) => {
    const message = payload?.message || 'Socket error';
    dispatch(setQuizError(message));
    dispatch(setLeaderboardError(message));
  });

  bindHandler(socket, 'contestEnded', (payload: { message: string }) => {
    dispatch(setQuizError(payload.message || 'Contest has ended'));
    // Optionally redirect to contest ended page
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/contest-ended';
      }, 2000);
    }
  });

  bindHandler(socket, 'contestInfo', (payload: { hasEnded: boolean; remainingTime: number; endTime: string }) => {
    if (payload.hasEnded) {
      dispatch(setQuizError('Contest has ended'));
    }
  });

  handlersRegistered = true;
};

export const connectSocket = createAsyncThunk<void, void, { state: RootState }>(
  'socket/connect',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const {
      auth: { accessToken },
    } = getState();

    const token = accessToken || localStorage.getItem('accessToken');

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const socket = socketManager.connect(token);
      setupSocketListeners(socket, dispatch as Dispatch);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to connect socket');
    }
  }
);

export const disconnectSocket = createAsyncThunk<void>(
  'socket/disconnect',
  async () => {
    clearHandlers(socketManager.getSocket());
    socketManager.disconnect();
  }
);

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    socketConnected(state) {
      state.isConnected = true;
      state.isConnecting = false;
      state.error = null;
    },
    socketDisconnected(state, action: PayloadAction<string | null | undefined>) {
      state.isConnected = false;
      state.isConnecting = false;
      state.lastDisconnectReason = action.payload ?? null;
    },
    socketError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isConnected = false;
      state.isConnecting = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectSocket.fulfilled, (state) => {
        state.isConnecting = false;
      })
      .addCase(connectSocket.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = (action.payload as string) || 'Failed to connect socket';
      })
      .addCase(disconnectSocket.fulfilled, (state) => {
        state.isConnected = false;
        state.isConnecting = false;
      });
  },
});

export const { socketConnected, socketDisconnected, socketError } = socketSlice.actions;
export default socketSlice.reducer;
