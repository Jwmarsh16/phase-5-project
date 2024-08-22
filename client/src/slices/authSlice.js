import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunks for login and registration
export const registerUser = createAsyncThunk('auth/registerUser', async (userData, thunkAPI) => {
  try {
    const response = await axios.post('http://localhost:5555/register', userData, { withCredentials: true });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to register');
  }
});

export const login = createAsyncThunk('auth/login', async ({ username, password }, thunkAPI) => {
  try {
    const response = await axios.post('http://localhost:5555/login', 
      { username, password }, 
      { withCredentials: true } // Ensure cookies are sent with the request
    );

    // Assuming the server returns the user ID along with the token
    const userId = response.data.user.id;
    return { id: userId };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to login');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await axios.post('http://localhost:5555/logout', {}, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return true; // Or any other confirmation data you want to pass
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to logout');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
    },
    // Reducer to handle setting user data
    setUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to register';
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = { id: action.payload.id };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to login';
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to logout';
      });
  },
});

export const { setUser, resetAuthState } = authSlice.actions;

export default authSlice.reducer;
