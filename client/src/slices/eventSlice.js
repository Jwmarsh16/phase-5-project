import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch all events
export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://localhost:5555/events', {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
  }
});

// Thunk to search events by name
export const searchEvents = createAsyncThunk('events/searchEvents', async (query, thunkAPI) => {
  try {
    const response = await axios.get(`http://localhost:5555/events?q=${query}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error('Error searching events:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to search events');
  }
});

// Thunk to fetch a specific event by ID
export const fetchEventById = createAsyncThunk('events/fetchEventById', async (id, thunkAPI) => {
  try {
    const response = await axios.get(`http://localhost:5555/events/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch event');
  }
});

// Thunk to create a new event
export const createEvent = createAsyncThunk('events/createEvent', async (eventData, thunkAPI) => {
  try {
    const response = await axios.post('http://localhost:5555/events', eventData, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create event');
  }
});

// Thunk to update an event
export const updateEvent = createAsyncThunk('events/updateEvent', async ({ id, eventData }, thunkAPI) => {
  try {
    const response = await axios.put(`http://localhost:5555/events/${id}`, eventData, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update event');
  }
});

// Thunk to delete an event
export const deleteEvent = createAsyncThunk('events/deleteEvent', async (id, thunkAPI) => {
  try {
    await axios.delete(`http://localhost:5555/events/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return { id }; // Return the event ID to remove it from the state
  } catch (error) {
    console.error('Error deleting event:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete event');
  }
});

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    searchResults: [], // Store search results
    currentEvent: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetEventState: (state) => {
      state.loading = false;
      state.error = null;
    },
    resetSearchResults: (state) => {
      state.searchResults = []; // Reset search results
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch events';
      })

      .addCase(searchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload; // Replace current events with search results
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search events';
      })

      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch event';
      })

      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create event';
      })

      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update event';
      })

      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event.id !== action.payload.id);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete event';
      });
  },
});

export const { resetEventState, resetSearchResults } = eventSlice.actions;
export default eventSlice.reducer;
