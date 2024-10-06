const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

// Send a message
const sendMessages = asyncHandler(async (req, res) => {

  const { recipientId, message } = req.body.messageData;

  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID does not exist' });
  }

  if (!message) {
    return res.status(400).json({ message: 'Text is required' });
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({ message: 'Recipient not found' });
  }

  try {
    const messageContent = await Message.create({
      senderId: req.user._id,
      recipientId: recipientId,
      text: message,
      status: 'sent'
    });

    
    
    res.status(200).json(messageContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const getAllMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const  {recipientId}  = req.params;

  // console.log("recipientId", recipientId);

  if (!userId) {
    return res.status(404).json({ message: 'userId is required' });
  }

  if (!recipientId) {
    return res.status(404).json({ message: 'recipientId is required' });
  }

  try {
    // Find messages where the logged-in user is either the sender or recipient, and the recipient is the selected friend
    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: recipientId },
        { senderId: recipientId, recipientId: userId }
      ]
    }).sort({ createdAt: 1 });

    // console.log("messages", messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});


// Mark messages as read
const markMessagesAsRead = asyncHandler(async (req, res) => {
  // console.log("senderId : \n",req.params);
  const  senderId  = req.params;

  // console.log("senderId : \n",senderId.recipientId);
  // console.log("recipientId : \n",req.user._id);

  if (!senderId) {
    return res.status(400).json({ message: 'SenderId is required' });
  }

  try {
    const result = await Message.updateMany(
      { senderId: senderId.recipientId, recipientId: req.user._id },
      { $set: {status: 'read' }}
    );

    // console.log("result : \n",result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const markMessagesAsDelivered = asyncHandler(async (req, res) => {
  const { messageIds } = req.body;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ message: 'Message IDs are required' });
  }

  try {
    const result = await Message.updateMany(
      { _id: { $in: messageIds }, recipientId: req.user._id },
      { status: 'delivered' }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const deleteMessages = asyncHandler(async (req, res) => {
  const  messageId  = req.params.messageId; // Extract the messageId from the URL parameters
  // console.log("messageId", messageId);
  // console.log("req.params", req.params.messageId);
  
  // Find the message by ID
  const message = await Message.findById(messageId);

  // console.log("rmessage", message);

  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Ensure only the sender or recipient can delete the message
  if (message.senderId.toString() !== req.user._id.toString() &&
      message.recipientId.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await Message.deleteOne({ _id: messageId});

});


module.exports = {
  sendMessages,
  getAllMessages,
  markMessagesAsDelivered,
  markMessagesAsRead,
  deleteMessages
};
