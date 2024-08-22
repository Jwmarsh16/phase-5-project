import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk for fetching RSVPs for a specific event
export const fetchRSVPs = createAsyncThunk('rsvps/fetchRSVPs', async (eventId, thunkAPI) => {
  try {
    const response = await axios.get(`http://localhost:5555/events/${eventId}/rsvps`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch RSVPs');
  }
});

// Thunk for creating a new RSVP
export const createRSVP = createAsyncThunk('rsvps/createRSVP', async (rsvpData, thunkAPI) => {
  try {
    const response = await axios.post('http://localhost:5555/rsvps', rsvpData, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to submit RSVP');
  }
});

const rsvpSlice = createSlice({
  name: 'rsvps',
  initialState: {
    rsvps: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetRsvpState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRSVPs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRSVPs.fulfilled, (state, action) => {
        state.loading = false;
        state.rsvps = action.payload;
      })
      .addCase(fetchRSVPs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch RSVPs';
      })
      .addCase(createRSVP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRSVP.fulfilled, (state, action) => {
        state.loading = false;
        state.rsvps.push(action.payload);
      })
      .addCase(createRSVP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit RSVP';
      });
  },
});

export const { resetRsvpState } = rsvpSlice.actions;
export default rsvpSlice.reducer;
