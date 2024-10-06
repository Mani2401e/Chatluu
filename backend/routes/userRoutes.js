const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUserStatus,
  updateUserStatus,
  getFriendsList,
  searchUsers,
  getSearchHistory,
  updateSearchHistory,
  sendFriendRequest,
  getFriendRequestsReceived,
  getFriendRequestsSent,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} = require('../controllers/userController');

const {
  sendMessages,
  getAllMessages,
  markMessagesAsRead,
  deleteMessages,
  markMessagesAsDelivered
} = require('../controllers/messageController');



const { protect } = require('../middleware/authMiddleware');

// User registration and login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile routes
router.get('/profile', protect, getUserProfile);  // Get user profile
router.put('/profile/user-status', protect, updateUserStatus);  // Update user status
router.get('/profile/user-status/:recipientId', protect, getUserStatus);  // Update user status
router.get('/profile/friends-list', protect, getFriendsList);   // Get friend requests sent
router.get('/profile/search-profile', protect, searchUsers);  // Search users
router.get('/profile/search-history', protect, getSearchHistory);  // get the Search history of users
router.put('/profile/search-history', protect, updateSearchHistory);  // update the Search history of users


// Nested routes under /Profile for friend requests
router.post('/profile/friend-request/send/:recipientId', protect, sendFriendRequest); // Send a friend request
router.get('/profile/add-friend/view', protect, getFriendRequestsSent);   // Get friend requests received
router.get('/profile/friend-request/view', protect, getFriendRequestsReceived);   // Get friend requests sent

router.put('/profile/friend-request/accept/:requestId', protect, acceptFriendRequest);  // Accept friend request
router.put('/profile/friend-request/reject/:requestId', protect, rejectFriendRequest);  // Reject friend request

router.delete('/profile/my-friends/remove/:requestId', protect, removeFriend);  // Remove a friend

router.post('/profile/chats/messages/:recipientId', protect, sendMessages);  // Send a message
router.get('/profile/chats/messages/:recipientId', protect, getAllMessages);  // Get all messages for a conversation
router.put('/profile/chats/messages/:recipientId/read', protect, markMessagesAsRead);  //
router.put('/profile/chats/messages/:recipientId/delivered', protect, markMessagesAsDelivered);  //
router.delete('/profile/chats/messages/:messageId', protect, deleteMessages);  // Delete a message


module.exports = router;


