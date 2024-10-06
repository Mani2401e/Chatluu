const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel'); 
const Message = require('../models/messageModel'); 

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if all fields are provided
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user with the given email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Check if a user with the given name already exists
  const nameExists = await User.findOne({ name });
  if (nameExists) {
    res.status(400);
    throw new Error('Username already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Send response if user creation is successful
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @desc    Get user status
// @route   GET /api/users/status
// @access  Private
const getUserStatus = asyncHandler(async (req, res) => {

  const { recipientId } = req.params;

  if (!recipientId) {
    res.status(400);
    throw new Error('Recipient ID is required');
  }

  try {
    // Check if the recipient exists
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      res.status(404);
      throw new Error('Recipient not found');
    }

    const recipientUserStatus = recipientUser.status;
    // console.log("recipientUserStatus",recipientUserStatus);
    
    res.status(200).json(recipientUserStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user status
// @route   PUT /api/users/status
// @access  Private
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !['online', 'offline'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  // console.log("status_backend", status);
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @desc    Get list friends accepted
// @route   GET /api/users/friends-list
// @access  Private
const getFriendsList = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Assuming the friendsList is an array of user IDs
    const friendsIds = user.friendsList;

    // Fetching the details of all friends based on their IDs
    const friends = await User.find({ _id: { $in: friendsIds } }).select('id name email status');

    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @desc    Search for users
// @route   GET /api/users/search
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error('Search query is required');
  }

  try {
    
    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclude the logged-in user
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password'); // Exclude password from search results
    
  
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get search history
// @route   GET /api/users/search-history
// @access  Private
const getSearchHistory = asyncHandler(async (req, res) => {
  try {
    
    const user = await User.findById(req.user._id).select('searchHistory');
    const searchHistory = user.searchHistory;
    // console.log("searchHistory",searchHistory);
    res.status(200).json(searchHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// @desc    Update search history
// @route   PUT /api/users/search-history
// @access  Private
const updateSearchHistory = asyncHandler(async (req, res) => {
  const  searchTermobject  = req.body; // object of user searched 
  // console.log("searchTermobject",searchTermobject);

  if (!searchTermobject || typeof searchTermobject !== 'object' || !searchTermobject._id) {
    res.status(400);
    throw new Error('A valid search term object with _id is required');
  }

  try {
    const user = await User.findById(req.user._id);
    
    // Check if the search history already contains the object with the same _id
    const isAlreadyInHistory = user.searchHistory.some(
      (historyItem) => historyItem._id.toString() === searchTermobject._id.toString()
    );

    if (!isAlreadyInHistory) {
      // Add the new search item (object) to the beginning of the array
      
      const searchHistory = {
        _id: searchTermobject._id,
        name: searchTermobject.name,
        email: searchTermobject.email,
      };
      user.searchHistory.push(searchHistory);
    }

    // Limit search history to the most recent 10 entries
    if (user.searchHistory.length > 10) {
      user.searchHistory = user.searchHistory.slice(0, 10);
    }

    await user.save();

    return user.searchHistory;

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



const sendFriendRequest = asyncHandler(async (req, res) => {
  const { recipientId } = req.params;

  const userSender = await User.findById(req.user);

  if (!recipientId) {
    res.status(400);
    throw new Error('Recipient ID is required');
  }

  // Check if the recipient exists
  const recipientUser = await User.findById(recipientId);
  if (!recipientUser) {
    res.status(404);
    throw new Error('Recipient not found');
  }


  // Check if a friend request already exists
  const existingRequest = recipientUser.friendRequestsReceived?.find((freq) => 
    freq.sender.toString() === req.user._id.toString()
  );


  if (existingRequest) {
    res.status(400);
    throw new Error('Friend request already sent');
  }

  // Create a new friend request
  const friendRequest = {
    sender: req.user._id,
    recipient: recipientId,
  };

  // Push the new request to the recipient's list
  recipientUser.friendRequestsReceived.push(friendRequest);
  await recipientUser.save();

  //Push the new request to the sender's list 
  userSender.friendRequestsSent.push(friendRequest);
  await userSender.save();

  res.status(201).json({ message: 'Friend request sent successfully' });
});



// @desc    Get friend requests received
// @route   GET /api/users/friend-requests/received
// @access  Private
const getFriendRequestsReceived = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('friendRequestsReceived')
    .populate('friendRequestsReceived.sender', 'name email');

  res.status(200).json(user.friendRequestsReceived);
});

// @desc    Get friend requests sent
// @route   GET /api/users/friend-requests/sent
// @access  Private
const getFriendRequestsSent = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('friendRequestsSent')
    .populate('friendRequestsSent.recipient', 'name email');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // console.log("getFriendRequestsSent",user.friendRequestsSent);
  res.status(200).json(user.friendRequestsSent);
});



// @desc    Accept a friend request
// @route   PUT /api/users/friend-requests/:requestId/accept
// @access  Private
const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const user = await User.findById(req.user._id); // logged-in user
  const receivedFriendRequest = user.friendRequestsReceived.find(
    request => request.sender.toString() === requestId
  );

  if (!receivedFriendRequest || receivedFriendRequest.recipient.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Friend request not found');
  }

  const userSender = await User.findById(receivedFriendRequest.sender); // request sending user

  userSender.friendsList.push({
    name: user.name,
    email: user.email,
    _id: user._id,
    status: user.status // Ensure status is available
  });

  user.friendsList.push({
    name: userSender.name,
    email: userSender.email,
    _id: userSender._id,
    status: userSender.status // Ensure status is available
  });

  // console.log('friendsList_sender', userSender.friendsList.status);
  // console.log('friendsList_user', user.friendsList.status);

  // Remove the request from the recipient's friendRequests array
  user.friendRequestsReceived = user.friendRequestsReceived.filter(
    request => request.sender.toString() !== requestId
  );
  await user.save();

  // Remove the request from the sender's friendRequests array
  userSender.friendRequestsSent = userSender.friendRequestsSent.filter(
    request => request.sender.toString() !== requestId
  );
  await userSender.save();

  // Respond with a success message or the friend request details
  res.status(200).json({ message: 'Friend request accepted and removed from list' });
});



// @desc    Reject a friend request
// @route   PUT /api/users/friend-requests/:requestId/reject
// @access  Private
const rejectFriendRequest = asyncHandler(async (req, res) => {

  const  requestId  = req.params;

  const user = await User.findById(req.user._id); // logged-in user
 
 
  const ReceivedFriendRequest = user.friendRequestsReceived.find(request => 
    request.sender.toString() === requestId.requestId
  );

  // console.log("ReceivedfriendRequest",ReceivedFriendRequest);
  if (!ReceivedFriendRequest) {
    res.status(404);
    throw new Error('Friend request not found');
  }

  user.friendRequestsReceived = user.friendRequestsReceived.filter(request => request.sender.toString() !== requestId.requestId);
  await user.save();


  const userSender = await User.findById(ReceivedFriendRequest.sender); // request sending user

  // Remove the request from the sender's friendRequestsSent array
  userSender.friendRequestsSent = userSender.friendRequestsSent.filter(request => request.sender.toString() !== requestId.requestId);
  await userSender.save();

  // Respond with a success message
  res.status(200).json({ message: 'Friend request rejected and removed from list' });
});

// @desc    Remove a friend
// @route   DELETE /api/users/friends/remove/:friendId
// @access  Private
const removeFriend = asyncHandler(async (req, res) => {
  const  friendId = req.params; // Get the friend's ID from the route parameters

  // console.log("Friend ID to remove:", friendId);

  const user = await User.findById(req.user._id); // Get the logged-in user

  // Check if the friend exists in the user's friends list
  const isFriendPresent = user.friendsList.some(friend => friend.toString() === friendId.requestId);

  if (!isFriendPresent) {
    res.status(404);
    throw new Error('Friend not found in your friends list');
  }

    user.friendsList = user.friendsList.filter(friend => friend.toString() !== friendId.requestId);
    await user.save();

    // Optionally, also remove the user from the friend's friends list
    const friendUser = await User.findById(friendId.requestId); // Get the friend user
    const isUserPresentInFriendList = friendUser.friendsList.some(friendId => friendId.toString() === req.user._id.toString());

    if (isUserPresentInFriendList) {
        friendUser.friendsList = friendUser.friendsList.filter(friendId => friendId.toString() !== req.user._id.toString()); // Remove the user from the friend's friends list
        await friendUser.save();
    }

    await Message.deleteMany({
      $or: [
        { senderId: req.user._id, recipientId: friendId.requestId },
        { senderId: friendId.requestId, recipientId: req.user._id }
      ]
    });



    // Respond with a success message
    res.status(200).json({ message: 'Friend removed from your friends list' });
});



// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
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
  removeFriend
};
