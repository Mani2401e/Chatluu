import axios from 'axios';

const USER_API_URL = '/chatluu/users/'; 

// Create new message
const sendMessages = async (messageData, token) => {
  const response = await axios.post(`${USER_API_URL}profile/chats/messages/${messageData.recipientId}`, { messageData }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Return message with 'sent' status
  return { ...response.data, status: 'sent' };
};

// Get all messages for a conversation
const getAllMessages = async (selectedFriendId, token) => {

  try {
    const response = await axios.get(`${USER_API_URL}profile/chats/messages/${selectedFriendId}`, {
      headers: { Authorization: `Bearer ${token}` }, // Corrected: headers go in the second argument
    });

    // console.log("response.data", response.data);
    // Return messages with 'received' status
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};


// Mark messages as Read
const markMessagesAsRead = async (recipientId, token) => {
  // console.log("recipientId",recipientId);
  const response = await axios.put(`${USER_API_URL}profile/chats/messages/${recipientId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Assuming the API returns an array of updated messages
  return response.data.map(msg => ({ ...msg, status: 'read' }));
};

// Mark messages as delivered
const markMessagesAsDelivered = async (recipientId, token) => {
  // console.log("recipientId",recipientId);
  const response = await axios.put(`${USER_API_URL}profile/chats/messages/${recipientId}/delivered`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Assuming the API returns an array of updated messages
  return response.data.map(msg => ({ ...msg, status: 'delivered' }));
};


// Delete a message
const deleteMessages = async (messageObject, token) => {
  const  id  = messageObject._id; // Destructure the id from the message object
  // console.log("id_service", id);
  // Pass the id in the URL as a path parameter
  const response = await axios.delete(`${USER_API_URL}profile/chats/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Optionally, you can return the whole message object or just the id
  return { id }; // or return messageObject if you want to return more data
};

// Update user status
const getFriendStatus = async (friendId, token) => {
  const response = await axios.get(`${USER_API_URL}profile/user-status/${friendId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("fstatus",response.data);
  
  return response.data;
};

// Update user status
const updateStatus = async (statusData, token) => {
  const response = await axios.put(`${USER_API_URL}profile/user-status`, statusData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get the list of friends
const getFriendsList = async (token) => {
  const response = await axios.get(`${USER_API_URL}profile/friends-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Search for users
const searchUsers = async (searchTerm, token) => {
  const response = await axios.get(`${USER_API_URL}profile/search-profile?query=${searchTerm}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const filteredUsers = response.data.filter((user) =>
    user.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );
  return filteredUsers;
};

// Send a friend request
const sendFriendRequest = async (recipientId, token) => {
  const response = await axios.post(`${USER_API_URL}profile/friend-request/send/${recipientId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Accept a friend request
const acceptFriendRequest = async (requestId, token) => {
  const response = await axios.put(`${USER_API_URL}profile/friend-request/accept/${requestId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Reject a friend request
const rejectFriendRequest = async (requestId, token) => {
  const response = await axios.put(`${USER_API_URL}profile/friend-request/reject/${requestId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get all sent friend requests
const getFriendRequestsSent = async (token) => {
  const response = await axios.get(`${USER_API_URL}profile/add-friend/view`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get all received friend requests
const getFriendRequestsReceived = async (token) => {
  const response = await axios.get(`${USER_API_URL}profile/friend-request/view`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update search history
const updateSearchHistory = async (searchTermObject, token) => {
  const response = await axios.put(`${USER_API_URL}profile/search-history`,  searchTermObject , {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get search history
const getSearchHistory = async (token) => {
  const response = await axios.get(`${USER_API_URL}profile/search-history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// Remove a friend
const removeFriend = async (requestId, token) => {
  // console.log("requestId",requestId);
  const response = await axios.delete(`${USER_API_URL}profile/my-friends/remove/${requestId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const chatService = {
  sendMessages,
  getAllMessages,
  markMessagesAsRead,
  markMessagesAsDelivered,
  deleteMessages,
  getFriendStatus,
  updateStatus,
  getFriendsList,
  searchUsers,
  updateSearchHistory,
  getSearchHistory,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequestsSent,
  getFriendRequestsReceived,
  removeFriend
};

export default chatService;
