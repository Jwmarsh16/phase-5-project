import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import axios from 'axios';

// Thunk to fetch all users
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://localhost:5555/users', {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch users';
    return thunkAPI.rejectWithValue(message);
  }
});

// Thunk to search users by name
export const searchUsers = createAsyncThunk('users/searchUsers', async (query, thunkAPI) => {
  try {
    const response = await axios.get(`http://localhost:5555/users?q=${query}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to search users';
    return thunkAPI.rejectWithValue(message);
  }
});

// Thunk to fetch the current user's profile
export const fetchUserProfileById = createAsyncThunk('users/fetchUserProfileById', async (id, thunkAPI) => {
  try {
    const response = await axios.get(`http://localhost:5555/profile/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch user profile';
    return thunkAPI.rejectWithValue(message);
  }
});

// Basic selector to get users from the state
const selectUsers = (state) => state.users.users;

// Memoized selector to get only active users
export const selectFilteredUsers = createSelector(
  [selectUsers],
  (users) => users.filter(user => user.active)
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    searchResults: [],
    profile: null,  // State property for the user profile
    loading: false,
    error: null,
  },
  reducers: {
    resetUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.profile = null; // Reset profile on logout or other state reset
    },
    resetSearchResults: (state) => {
      state.searchResults = []; // Reset search results
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      })

      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload; // Replace current users with search results
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search users';
      })

      // Handle fetchUserProfileById
      .addCase(fetchUserProfileById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileById.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfileById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user profile';
      });
  },
});

export const { resetUserState, resetSearchResults } = userSlice.actions;
export default userSlice.reducer;
