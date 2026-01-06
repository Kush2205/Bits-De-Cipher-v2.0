import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import socketManager from '../../lib/socket';
import { submitAnswer as submitAnswerApi, useHint as useHintApi } from '../../services/quiz.service';
import type { BackendQuestion, BackendUserStats, InitialDataPayload } from '../../types';
import type { RootState } from '..';

export interface SubmitAnswerResult {
  isCorrect: boolean;
  awardedPoints: number;
  alreadyCompleted: boolean;
  totalPoints?: number;
  currentQuestionIndex?: number;
  nextQuestion?: BackendQuestion | null;
}

interface QuizState {
  currentQuestion: BackendQuestion | null;
  userStats: BackendUserStats | null;
  isJoined: boolean;
  isJoining: boolean;
  isSubmitting: boolean;
  usedHints: { hint1: boolean; hint2: boolean };
  lastSubmitResult: SubmitAnswerResult | null;
  hintLockMessage: string | null;
  error: string | null;
}

const initialState: QuizState = {
  currentQuestion: null,
  userStats: null,
  isJoined: false,
  isJoining: false,
  isSubmitting: false,
  usedHints: { hint1: false, hint2: false },
  lastSubmitResult: null,
  hintLockMessage: null,
  error: null,
};

export const joinQuizRoom = createAsyncThunk<void, void, { state: RootState }>(
  'quiz/joinQuizRoom',
  async (_, { rejectWithValue }) => {
    try {
      if (!socketManager.getConnectionStatus()) {
        throw new Error('Socket not connected');
      }

      socketManager.emit('joinQuiz');
    } catch (error: any) {
      const message = error?.message || 'Unable to join quiz';
      return rejectWithValue(message);
    }
  }
);

export const submitAnswer = createAsyncThunk<
  SubmitAnswerResult,
  { questionId: number; answer: string },
  { state: RootState }
>(
  'quiz/submitAnswer',
  async ({ questionId, answer }, { getState, rejectWithValue }) => {
    const {
      quiz: { usedHints },
    } = getState();

    try {
      const result = await submitAnswerApi({
        questionId: String(questionId),
        submittedText: answer,
        usedHint1: usedHints.hint1,
        usedHint2: usedHints.hint2,
      });

      return result;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to submit answer';
      return rejectWithValue(message);
    }
  }
);

type UseHintResponse =
  | { hintNumber: 1 | 2; locked: true; message: string; unlocksAt?: string; remainingMs?: number }
  | { hintNumber: 1 | 2; locked?: false; hintText?: string };

export const useHint = createAsyncThunk<
  UseHintResponse,
  { questionId: number; hintNumber: 1 | 2 }
>('quiz/useHint', async ({ questionId, hintNumber }, { rejectWithValue }) => {
  try {
    const result = (await useHintApi({ questionId, hintNumber })) as any;
    if (result?.locked) {
      return {
        hintNumber,
        locked: true,
        message: result.message || 'Hints will be unlocked soon',
        unlocksAt: result.unlocksAt,
        remainingMs: result.remainingMs,
      };
    }

    return {
      hintNumber,
      locked: false,
      hintText: result?.hintText,
    };
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Failed to use hint';
    return rejectWithValue(message);
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setInitialData(state, action: PayloadAction<InitialDataPayload>) {
      state.currentQuestion = action.payload.currentQuestion;
      state.userStats = action.payload.userStats;
      state.isJoined = true;
      state.isJoining = false;
      state.error = null;
      state.hintLockMessage = null;
      // Load hint usage from backend if available
      if (action.payload.hintUsage) {
        state.usedHints = {
          hint1: action.payload.hintUsage.hint1Used,
          hint2: action.payload.hintUsage.hint2Used,
        };
      } else {
        state.usedHints = { hint1: false, hint2: false };
      }
    },
    updateQuestionPoints(state, action: PayloadAction<{ questionId: number; points: number }>) {
      if (state.currentQuestion && state.currentQuestion.id === action.payload.questionId) {
        state.currentQuestion.points = action.payload.points;
      }
    },
    setDisconnected(state) {
      state.isJoined = false;
      state.isJoining = false;
    },
    setCurrentQuestion(state, action: PayloadAction<BackendQuestion | null>) {
      state.currentQuestion = action.payload;
      state.hintLockMessage = null;
    },
    setUserStats(state, action: PayloadAction<BackendUserStats | null>) {
      state.userStats = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    clearHintLockMessage(state) {
      state.hintLockMessage = null;
    },
    clearLastSubmitResult(state) {
      state.lastSubmitResult = null;
    },
    resetHints(state) {
      state.usedHints = { hint1: false, hint2: false };
      state.hintLockMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinQuizRoom.pending, (state) => {
        state.isJoining = true;
        state.error = null;
      })
      .addCase(joinQuizRoom.fulfilled, (state) => {
        state.isJoining = true;
      })
      .addCase(joinQuizRoom.rejected, (state, action) => {
        state.isJoining = false;
        state.error = (action.payload as string) || 'Failed to join quiz';
      })
      .addCase(submitAnswer.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.lastSubmitResult = action.payload;

        if (action.payload.nextQuestion !== undefined) {
          state.currentQuestion = action.payload.nextQuestion ?? null;
        }

        if (state.userStats) {
          state.userStats = {
            ...state.userStats,
            totalPoints: action.payload.totalPoints ?? state.userStats.totalPoints,
            currentQuestionIndex: action.payload.currentQuestionIndex ?? state.userStats.currentQuestionIndex,
          };
        }

        if (action.payload.isCorrect && !action.payload.alreadyCompleted) {
          state.usedHints = { hint1: false, hint2: false };
          state.hintLockMessage = null;
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = (action.payload as string) || 'Failed to submit answer';
      })
      .addCase(useHint.fulfilled, (state, action) => {
        if ((action.payload as any).locked) {
          state.hintLockMessage = (action.payload as any).message || 'Hints will be unlocked soon';
          return;
        }

        state.hintLockMessage = null;

        if (action.payload.hintNumber === 1) {
          state.usedHints.hint1 = true;
        } else {
          state.usedHints.hint2 = true;
        }

        // Inject hint text into current question if provided (backend hides until unlocked)
        const hintText = (action.payload as any).hintText as string | undefined;
        if (hintText && state.currentQuestion?.hints) {
          const idx = state.currentQuestion.hints.findIndex((h) => h.number === action.payload.hintNumber);
          if (idx !== -1) {
            state.currentQuestion.hints[idx].hintText = hintText;
          }
        }
      })
      .addCase(useHint.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to use hint';
      });
  },
});

export const {
  setInitialData,
  setCurrentQuestion,
  setUserStats,
  setError,
  clearError,
  clearHintLockMessage,
  clearLastSubmitResult,
  resetHints,
  setDisconnected,
  updateQuestionPoints,
} = quizSlice.actions;

export default quizSlice.reducer;
