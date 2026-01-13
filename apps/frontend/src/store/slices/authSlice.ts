import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {login as loginApi,signup as signupApi,signupAdmin as signupAdminApi,logout as logoutApi,googleLogin as googleLoginApi,getCurrentUser,} from '../../services/auth.service';
import type {AuthResponse,LoginCredentials,SignupCredentials,User,AdminSugnupCredentials} from '../../types/user.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error: string | null;
  initialized: boolean;
}

const loadToken = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const persistToken = (key: string, value: string | null | undefined) => {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
  }
};

const initialState: AuthState = {
  user: null,
  accessToken: loadToken('accessToken'),
  refreshToken: loadToken('refreshToken'),
  status: 'idle',
  error: null,
  initialized: false,
};

const storeTokens = (payload: AuthResponse) => {
  persistToken('accessToken', payload.accessToken);
  persistToken('refreshToken', payload.refreshToken);
};

const clearTokens = () => {
  persistToken('accessToken', null);
  persistToken('refreshToken', null);
};

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  return fallback;
};

export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials.email, credentials.password);
      storeTokens(response);
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to login';
      return rejectWithValue(message);
    }
  }
);

export const signupUser = createAsyncThunk<AuthResponse, SignupCredentials>(
  'auth/signup',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await signupApi(credentials.email, credentials.password, credentials.name);
      storeTokens(response);
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to signup';
      return rejectWithValue(message);
    }
  }
);

export const signupAdmin = createAsyncThunk<AuthResponse, AdminSugnupCredentials>(
  'auth/admin/signup',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await signupAdminApi(credentials.email, credentials.password , credentials.adminSecret , credentials.name);
      storeTokens(response);
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to signup';
      return rejectWithValue(message);
    }
  }
);

export const googleLoginUser = createAsyncThunk<AuthResponse, string>(
  'auth/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      const response = await googleLoginApi(credential);
      storeTokens(response);
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Google login failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<User>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response.user ?? response;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to fetch current user';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk<void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      clearTokens();
    } catch (error: any) {
      clearTokens();
      const message = error?.response?.data?.message || 'Failed to logout';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = resolveErrorMessage(action.payload, 'Failed to login');
      })
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = resolveErrorMessage(action.payload, 'Failed to signup');
      })
      .addCase(googleLoginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.status = 'error';
        state.error = resolveErrorMessage(action.payload, 'Google login failed');
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = state.status === 'authenticated' ? state.status : 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload as User;
        state.status = 'authenticated';
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.initialized = true;
        state.user = null;
        state.status = 'idle';
        state.error = resolveErrorMessage(action.payload, 'Failed to fetch user');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = 'idle';
        state.error = resolveErrorMessage(action.payload, 'Failed to logout');
      })
      .addCase(signupAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupAdmin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(signupAdmin.rejected, (state, action) => {
        state.status = 'error';
        state.error = resolveErrorMessage(action.payload, 'Failed to signup admin');
      });

  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
