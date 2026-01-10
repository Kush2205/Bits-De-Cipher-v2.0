import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import socketManager from '../../lib/socket';
import { fetchLeaderboardByView } from '../../services/leaderboard.service';
import type { LeaderboardEntry, LeaderboardView } from '../../types/leaderboard';
import type { RootState } from '..';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  view: LeaderboardView;
  limit: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  isRefreshing: boolean;
  currentUserRank: number | null;
  currentUserId: string | null;
}

const initialState: LeaderboardState = {
  entries: [],
  view: 'top',
  limit: 15,
  status: 'idle',
  error: null,
  isRefreshing: false,
  currentUserRank: null,
  currentUserId: null,
};

const updateRank = (state: LeaderboardState) => {
  if (!state.currentUserId) {
    state.currentUserRank = null;
    return;
  }
  const idx = state.entries.findIndex((entry) => entry.id === state.currentUserId);
  state.currentUserRank = idx === -1 ? null : idx + 1;
};

export const fetchLeaderboard = createAsyncThunk<{ entries: LeaderboardEntry[]; view: LeaderboardView },{ view: LeaderboardView; limit?: number; userId?: string | null }>('leaderboard/fetch', async ({ view, limit }, { rejectWithValue }) => {
  try {
    const entries = await fetchLeaderboardByView(view, limit);
    return { entries, view };
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Failed to load leaderboard';
    return rejectWithValue(message);
  }
});

export const requestTopLeaderboard = createAsyncThunk<void,{ limit?: number }>('leaderboard/requestTop', async ({ limit }, { dispatch }) => {
  if (limit) {
    dispatch(setLimit(limit));
  }
  dispatch(setStatus('loading'));

  if (socketManager.getConnectionStatus()) {
    socketManager.emit('requestLeaderboard', { limit: limit ?? initialState.limit });
  } else {
    dispatch(fetchLeaderboard({ view: 'top', limit: limit ?? initialState.limit }));
  }
});

export const requestAllLeaderboard = createAsyncThunk<void, void>(
  'leaderboard/requestAll',
  async (_, { dispatch }) => {
    dispatch(setStatus('loading'));
    if (socketManager.getConnectionStatus()) {
      socketManager.emit('requestAllLeaderboard');
    } else {
      dispatch(fetchLeaderboard({ view: 'all' }));
    }
  }
);

export const refreshLeaderboard = createAsyncThunk<void, { userId?: string | null }, { state: RootState }>(
  'leaderboard/refresh',
  async ({ userId }, { getState, dispatch }) => {
    const { view, limit } = getState().leaderboard;
    if (userId) {
      dispatch(setCurrentUserId(userId));
    }
    dispatch(setRefreshing(true));

    if (socketManager.getConnectionStatus()) {
      if (view === 'all') {
        socketManager.emit('requestAllLeaderboard');
      } else {
        socketManager.emit('requestLeaderboard', { limit });
      }
    } else {
      dispatch(fetchLeaderboard({ view, limit, userId }));
    }
    dispatch(setRefreshing(false));
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setTopLeaderboard(state, action: PayloadAction<LeaderboardEntry[]>) {
      state.entries = action.payload;
      state.view = 'top';
      state.status = 'success';
      state.error = null;
      updateRank(state);
    },
    setAllLeaderboard(state, action: PayloadAction<LeaderboardEntry[]>) {
      state.entries = action.payload;
      state.view = 'all';
      state.status = 'success';
      state.error = null;
      updateRank(state);
    },
    handleLeaderboardUpdate(
      state,
      action: PayloadAction<{ userId: string; totalPoints: number; currentQuestionIndex?: number }>
    ) {
      const idx = state.entries.findIndex((entry) => entry.id === action.payload.userId);
      if (idx === -1) return;
      state.entries[idx] = {
        ...state.entries[idx],
        totalPoints: action.payload.totalPoints,
        currentQuestionIndex:
          action.payload.currentQuestionIndex ?? state.entries[idx].currentQuestionIndex,
      };
      state.entries.sort((a, b) => b.totalPoints - a.totalPoints);
      updateRank(state);
    },
    setStatus(state, action: PayloadAction<LeaderboardState['status']>) {
      state.status = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      if (action.payload) {
        state.status = 'error';
      }
    },
    setRefreshing(state, action: PayloadAction<boolean>) {
      state.isRefreshing = action.payload;
    },
    clearLeaderboard(state) {
      state.entries = [];
      state.status = 'idle';
      state.error = null;
      state.currentUserRank = null;
    },
    updateCurrentUserRank(state, action: PayloadAction<string | undefined>) {
      state.currentUserId = action.payload ?? null;
      updateRank(state);
    },
    setCurrentUserId(state, action: PayloadAction<string | null>) {
      state.currentUserId = action.payload;
      updateRank(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.entries = action.payload.entries;
        state.view = action.payload.view;
        state.status = 'success';
        state.error = null;
        updateRank(state);
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.status = 'error';
        state.error = (action.payload as string) || 'Failed to load leaderboard';
      });
  },
});

export const {
  setTopLeaderboard,
  setAllLeaderboard,
  handleLeaderboardUpdate,
  setStatus,
  setLimit,
  setError,
  setRefreshing,
  clearLeaderboard,
  updateCurrentUserRank,
  setCurrentUserId,
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
