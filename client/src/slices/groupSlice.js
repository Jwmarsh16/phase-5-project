import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch all groups
export const fetchGroups = createAsyncThunk('groups/fetchGroups', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://localhost:5555/groups', {
      withCredentials: true,  // Include cookies in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch groups');
  }
});

// Thunk to search groups by name
export const searchGroups = createAsyncThunk('groups/searchGroups', async (query, thunkAPI) => {
  try {
    const response = await axios.get(`http://localhost:5555/groups?q=${query}`, {
      withCredentials: true,  // Include cookies in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error searching groups:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to search groups');
  }
});

// Thunk to fetch a specific group by ID
export const fetchGroupById = createAsyncThunk('groups/fetchGroupById', async (id, thunkAPI) => {
  try {
    const response = await axios.get(`http://localhost:5555/groups/${id}`, {
      withCredentials: true,  // Include cookies in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching group by ID:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch group');
  }
});

// Thunk to create a new group
export const createGroup = createAsyncThunk('groups/createGroup', async (groupData, thunkAPI) => {
  try {
    const response = await axios.post('http://localhost:5555/groups', groupData, {
      withCredentials: true,  // Include cookies in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create group');
  }
});

// Thunk to delete a group
export const deleteGroup = createAsyncThunk('groups/deleteGroup', async (groupId, thunkAPI) => {
  try {
    const response = await axios.delete(`http://localhost:5555/groups/${groupId}`, {
      withCredentials: true,  // Include cookies in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete group');
  }
});

// Thunk to fetch group invitations
export const fetchGroupInvitations = createAsyncThunk('groups/fetchGroupInvitations', async (_, thunkAPI) => {
  try {
    const response = await axios.get('http://localhost:5555/invitations', {
      withCredentials: true,  // Include cookies in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch invitations');
  }
});

// Thunk to send a group invitation
export const sendGroupInvite = createAsyncThunk(
  'groups/sendGroupInvite',
  async ({ groupId, invitedUserId }, thunkAPI) => {
    try {
      const response = await axios.post(
        `http://localhost:5555/groups/${groupId}/invite`,
        {
          group_id: groupId,      // Include group_id in the request body
          invited_user_id: invitedUserId
        },
        {
          withCredentials: true,  // Include cookies in the request
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending group invitation:', error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to send invitation');
    }
  }
);

export const acceptGroupInvite = createAsyncThunk('groups/acceptGroupInvite', async (inviteId, thunkAPI) => {
  try {
    const response = await axios.put(`http://localhost:5555/invitations/${inviteId}/accept`, {}, {
      withCredentials: true,  // Include cookies in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to accept invitation');
  }
});

// Thunk to deny a group invitation
export const denyGroupInvite = createAsyncThunk('groups/denyGroupInvite', async (inviteId, thunkAPI) => {
  try {
    const response = await axios.put(`http://localhost:5555/invitations/${inviteId}/deny`, {}, {
      withCredentials: true,  // Include cookies in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error denying invitation:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to deny invitation');
  }
});

const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    searchResults: [], // Store search results
    currentGroup: null,
    invitations: [],
    loading: false,
    error: null,
    inviteStatus: null,
    inviteError: null,
  },
  reducers: {
    resetGroupState: (state) => {
      state.loading = false;
      state.error = null;
      state.inviteStatus = null;
      state.inviteError = null;
    },
    resetSearchResults: (state) => {
      state.searchResults = []; // Reset search results
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchGroups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch groups';
      })

      // Handle searchGroup
      .addCase(searchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload; // Replace current groups with search results
      })
      .addCase(searchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search groups';
      })

      // Handle fetchGroupById
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch group';
      })

      // Handle createGroup
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create group';
      })

      // Handle deleteGroup
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(group => group.id !== action.meta.arg); // Remove the deleted group from state
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete group';
      })

      // Handle sendGroupInvite
      .addCase(sendGroupInvite.pending, (state) => {
        state.inviteStatus = null;
        state.inviteError = null;
        state.loading = true;
      })
      .addCase(sendGroupInvite.fulfilled, (state) => {
        state.inviteStatus = 'success';
        state.loading = false;
      })
      .addCase(sendGroupInvite.rejected, (state, action) => {
        state.inviteStatus = 'failed';
        state.inviteError = action.payload || 'Failed to send invitation';
        state.loading = false;
      })

      // Handle fetchGroupInvitations
      .addCase(fetchGroupInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.invitations = action.payload;
      })
      .addCase(fetchGroupInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch invitations';
      })

      // Handle acceptGroupInvite
      .addCase(acceptGroupInvite.pending, (state) => {
        state.inviteStatus = null;
        state.inviteError = null;
        state.loading = true;
      })
      .addCase(acceptGroupInvite.fulfilled, (state, action) => {
        state.inviteStatus = 'success';
        state.loading = false;
      })
      .addCase(acceptGroupInvite.rejected, (state, action) => {
        state.inviteStatus = 'failed';
        state.inviteError = action.payload || 'Failed to accept invitation';
        state.loading = false;
      })

      // Handle denyGroupInvite
      .addCase(denyGroupInvite.pending, (state) => {
        state.inviteStatus = null;
        state.inviteError = null;
        state.loading = true;
      })
      .addCase(denyGroupInvite.fulfilled, (state, action) => {
        state.inviteStatus = 'success';
        state.loading = false;
      })
      .addCase(denyGroupInvite.rejected, (state, action) => {
        state.inviteStatus = 'failed';
        state.inviteError = action.payload || 'Failed to deny invitation';
        state.loading = false;
      });
  },
});

export const { resetGroupState, resetSearchResults } = groupSlice.actions;
export default groupSlice.reducer;
