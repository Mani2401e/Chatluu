import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from './chatService';


import { CurrentUserId } from './selector';



const initialState = {
  messages: [], // Stores messages for the selected conversation
  selectedFriend: null, // Track which friend is selected
  status: null,
  friendStatus: 'offline',
  friendRequestsReceived: [],
  friendRequestsSent: [],
  searchResults: [],
  friendsList: [],
  searchHistory: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new message
export const sendMessages = createAsyncThunk(
  'chats/sendMessages',
  
  async (messageData, thunkAPI) => {
    try {
      const loggedInUserId = CurrentUserId(thunkAPI.getState());
      const token = thunkAPI.getState().auth.user.token;
      const message = await chatService.sendMessages(messageData, token);
      // socket.emit("new message", messageData);
      // Return the message with updated status
      return {
        message: { ...message, status: 'sent', senderId: loggedInUserId },
        loggedInUserId, // Return the logged-in user ID along with the message
      };

    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// Get all messages for a conversation
export const getAllMessages = createAsyncThunk(
  'chats/getAllMessages',
  async (selectedFriendId, thunkAPI) => {
    try {
      const loggedInUserId = CurrentUserId(thunkAPI.getState()); // Get logged-in user ID
      const token = thunkAPI.getState().auth.user.token;
      const messages = await chatService.getAllMessages(selectedFriendId,token);
      // Socket.emit("joint chat", selectedFriend._id);

      // console.log("messages",messages);
      return {
        messages,
        loggedInUserId, // Include loggedInUserId in the returned payload
      };
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


// mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  'chats/markMessagesAsRead', 
  async (recipientId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const messages = await chatService.markMessagesAsRead(recipientId, token);
      // Return updated messages with status changed to 'read'
      return messages.map(msg => ({ ...msg, status: 'read' }));
      
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


// mark messages as delivered
export const markMessagesAsDelivered = createAsyncThunk(
  'chats/markMessagesAsDelivered', 
  async (recipientId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const messages = await chatService.markMessagesAsDelivered(recipientId, token);
      // Return updated messages with status changed to 'read'
      return messages.map(msg => ({ ...msg, status: 'delivered' }));
      
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);



// Delete a message
export const deleteMessages = createAsyncThunk(
  'chats/deleteMessages',
  async (messageObject, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // Now pass the whole object instead of just the id
      return await chatService.deleteMessages(messageObject, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user status
export const getFriendStatus = createAsyncThunk(
  'chats/getStatus',
  async (friendId, thunkAPI) => {
    try {
    
      const authState = thunkAPI.getState().auth;

      if (!authState.user || !authState.user.token) {
        throw new Error('User or token is missing in the auth state');
      }
      const token = authState.user.token;
      return await chatService.getFriendStatus(friendId, token);
    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user status
export const updateStatus = createAsyncThunk(
  'chats/updateStatus',
  async (statusData, thunkAPI) => {
    try {
    
      const authState = thunkAPI.getState().auth;

      if (!authState.user || !authState.user.token) {
        throw new Error('User or token is missing in the auth state');
      }
      const token = authState.user.token;
      return await chatService.updateStatus(statusData, token);
    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user friends list
export const getFriendsList = createAsyncThunk(
  'chats/getFriendsList',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getFriendsList(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Send friend request
export const sendFriendRequest = createAsyncThunk(
  'chats/sendFriendRequest', 
  async (recipientId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.sendFriendRequest(recipientId, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Accept friend request
export const acceptFriendRequest = createAsyncThunk(
  'chats/acceptFriendRequest', 
  async (requestId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.acceptFriendRequest(requestId, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reject friend request
export const rejectFriendRequest = createAsyncThunk(
  'chats/rejectFriendRequest', 
  async (requestId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.rejectFriendRequest(requestId, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all friend requests Received
export const getFriendRequestsReceived = createAsyncThunk(
  'chats/getFriendRequestsReceived', 
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getFriendRequestsReceived(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all friend requests Sent
export const getFriendRequestsSent = createAsyncThunk(
  'chats/getFriendRequestsSent', 
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getFriendRequestsSent(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Search users
export const searchUsers = createAsyncThunk(
  'chats/searchUsers', 
  async (searchTerm, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.searchUsers(searchTerm, token);
      
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }

  
);

// Update search history
export const updateSearchHistory = createAsyncThunk(
  'chats/updateSearchHistory', 
  async (searchTermobject, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.updateSearchHistory(searchTermobject, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get search history
export const getSearchHistory = createAsyncThunk(
  'chats/getSearchHistory', 
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getSearchHistory(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


// Reject friend request
export const removeFriend = createAsyncThunk(
  'chats/removeFriend', 
  async (requestId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // console.log("requestId",requestId);
      return await chatService.removeFriend(requestId, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    resetChat: (state) => {
      state.messages = [];
      state.selectedFriend = null;
      state.status = null;
      state.friendStatus = 'offline';
      state.friendRequestsReceived = [];
      state.friendRequestsSent = [];
      state.searchResults = [];
      state.friendsList = [];
      state.searchHistory = [];
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    selectFriend: (state, action) => {
      state.selectedFriend = action.payload; // Set the currently selected friend
    },
  },
  extraReducers: (builder) => {
    builder
       // Handle getMessages
       .addCase(getAllMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const messages = action.payload; // Destructure the logged-in user ID
        // console.log("messages",messages);
        state.messages = messages;
        // state.messages = messages.map(msg => ({
        //   ...msg,
          
        //   status: msg.senderId === loggedInUserId ? 'sent' : 'received', // Check if the message was sent or received
        // }));
        // console.log("loggedInUserId",loggedInUserId);
      })
      .addCase(getAllMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle sendMessages
      .addCase(sendMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const { message, loggedInUserId } = action.payload; // Destructure the logged-in user ID
        if (!Array.isArray(state.messages)) {
          state.messages = []; // Reset to an empty array if it is not an array
        }
      
        state.messages.push(message); // Safely add the new message
      })
      .addCase(sendMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle marking messages read
      .addCase(markMessagesAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = state.messages.map(msg => {
          // Update status for the messages that were marked as read
          const isRead = action.payload.find(readMsg => readMsg.id === msg.id);
          return isRead ? { ...msg, status: 'read' } : msg;
        });
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Handle marking messages delivered
      .addCase(markMessagesAsDelivered.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markMessagesAsDelivered.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = state.messages.map(msg => {
          // Update status for the messages that were marked as read
          const isRead = action.payload.find(readMsg => readMsg.id === msg.id);
          return isRead ? { ...msg, status: 'read' } : msg;
        });
      })
      .addCase(markMessagesAsDelivered.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle deleteMessage
      .addCase(deleteMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages = state.messages.filter(
          (message) => message._id !== action.payload.id
        );
      })
      .addCase(deleteMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle getStatus
      .addCase(getFriendStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFriendStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendStatus = action.payload;
        console.log("action.payload",state.friendStatus);
      })
      .addCase(getFriendStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle updateStatus
      .addCase(updateStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.status = action.payload;
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      //Handle getFriendslist
      .addCase(getFriendsList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFriendsList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendsList = (action.payload);
      })
      .addCase(getFriendsList.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })


      // Handle sendFriendRequest
      .addCase(sendFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendRequestsSent.push(action.payload);
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle acceptFriendRequest
      .addCase(acceptFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendRequestsReceived = state.friendRequestsReceived.filter(
          (request) => request._id !== action.payload.id
        );
        state.friendsList.push(action.payload.friend);
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle rejectFriendRequest
      .addCase(rejectFriendRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendRequestsReceived = state.friendRequestsReceived.filter(
          (request) => request._id !== action.payload.id
        );
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle getFriendRequests
      .addCase(getFriendRequestsReceived.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFriendRequestsReceived.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendRequestsReceived = action.payload;
      })
      .addCase(getFriendRequestsReceived.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Handle getFriendRequests
      .addCase(getFriendRequestsSent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFriendRequestsSent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.friendRequestsSent = action.payload;
      })
      .addCase(getFriendRequestsSent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Handle searchUsers
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.searchResults = action.payload;
        // console.log("searchResults_Reducers",state.searchResults);
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle updateSearchHistory
      .addCase(updateSearchHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSearchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.searchHistory = (action.payload); // Update search history
      })
      .addCase(updateSearchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Handle getSearchHistory
      .addCase(getSearchHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSearchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.searchHistory = action.payload; // Populate search history
      })
      .addCase(getSearchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(removeFriend.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Remove the friend from the friends list

        // console.log(" action.payload.id", action.payload.id);

        state.friendsList = state.friendsList.filter(
          (friend) => friend._id !== action.payload.id
        );

        // Find the friend's user to update their friends list
        const friendUser = state.friendsList.find(
          (friend) => friend._id === action.payload.id
        );

        // If the friend exists, remove the logged-in user's ID from their friendsList
        if (friendUser) {
          friendUser.friendsList = friendUser.friendsList.filter(
            (friend) => friend._id !== action.payload.loggedInUserId // Ensure the logged-in user's ID is removed
          );
        }

        // Optionally handle any other state updates as needed
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Ensure the error message is set
      });
  },
});

// Export actions
export const { resetChat, selectFriend } = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
