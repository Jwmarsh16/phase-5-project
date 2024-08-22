import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import groupReducer from './slices/groupSlice';
import rsvpReducer from './slices/rsvpSlice';
import commentReducer from './slices/commentSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    groups: groupReducer,
    rsvps: rsvpReducer,
    comments: commentReducer,
    users: userReducer,
  },
});

export default store;

