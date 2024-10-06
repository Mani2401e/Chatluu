const express = require('express');
const router = express.Router();
const {
  sendMessages,
  getMessages,
  markMessagesAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');


// Route for sending a message
router.post('/messages', protect, sendMessages);
// Route for getting messages between users
router.get('/messages/:recipientId', protect, getMessages);
// Route for marking messages as read
router.put('/read', protect, markMessagesAsRead);

module.exports = router;
