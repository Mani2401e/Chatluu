import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllMessages, sendMessages, selectFriend, getFriendStatus, deleteMessages } from '../features/chats/chatSlice';
import Spinner from '../components/LoadingSpinner'

// Helper function to format the date and time
const formatDate = (date) => {
  return new Date(date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatInterface = ({ friend }) => {
  const [input, setInput] = useState('');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });
  const [selectedMessage, setSelectedMessage] = useState(null); // Track the message for which the menu is open
  const { isLoading } = useSelector((state) => state.chats.isLoading);
  const friendStatus = useSelector((state) => state.chats.friendStatus);
  const menuRef = useRef(null); // Ref for dropdown menu
  const messagesEndRef = useRef(null); // Ref for the end of the message list
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch();



  const messagesList = useSelector((state) => state.chats.messages);
  // Fetch messages between the logged-in user and the selected friend
// Polling effect to fetch messages periodically
useEffect(() => {
  if (friend) {
    const intervalId = setInterval(() => {
      dispatch(getFriendStatus(friend._id));
      console.log("friendStatus",friendStatus);
      
      dispatch(getAllMessages(friend._id));
    }, 1000); // Fetch messages every 1000 milliseconds (1 second)

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }
}, [dispatch, friend]);



  // Get messages list from Redux store
  

// Filter messages only for the selected friend
const filteredMessages = Array.isArray(messagesList.messages) 
  ? messagesList.messages.filter((msg) => {
      const isSender = msg.senderId === friend._id; // Friend sent the message
      const isRecipient = msg.recipientId === friend._id; // Friend received the message
      return isSender || isRecipient; // Show only messages involving the current friend
    }) 
  : []; // Return an empty array if messagesList is invalid


  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);



  // Group messages by date
  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, message) => {
      const messageDate = formatDate(message.createdAt);
      if (!acc[messageDate]) acc[messageDate] = [];
      acc[messageDate].push(message);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(filteredMessages);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Dispatch the sendMessages action to send a new message
    const messageData = {
      recipientId: friend._id,
      message: input,
    };
    dispatch(getFriendStatus(friend._id));
    dispatch(sendMessages(messageData));
    // console.log("messageData",messageData);
    // console.log("messagesList",messagesList);
    
    setTimeout(() => {
      dispatch(getAllMessages(friend._id));
    }, 100);

    setInput('');
  };

  const handleDeleteMessage = async (msg) => {
    try {
      dispatch(getFriendStatus(friend._id));
      dispatch(deleteMessages(msg));
      setTimeout(() => {
        dispatch(getAllMessages(friend._id));
      }, 400);
      setSelectedMessage(null); // Close the menu after deleting the message
      closeContextMenu();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const toggleMenu = (msg) => {
    if (selectedMessage === msg._id) {
      // If clicked again on the same message, close the menu
      setSelectedMessage(null);
    } else {
      // Open the menu for the clicked message
      setSelectedMessage(msg._id);
    }
  };

  const closeMenu = () => {
    setSelectedMessage(null); // Close the dropdown
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault(); // Prevent the default context menu
    const x = e.clientX;
    const y = e.clientY;

    // Adjust position to keep the menu within viewport boundaries
    const adjustedX = x + 200 > window.innerWidth ? x - 150 : x; // Move left if it exceeds the window width
    const adjustedY = y + 60 > window.innerHeight ? y - 60 : y; // Move up if it exceeds the window height

    setContextMenu({ visible: true, x: adjustedX, y: adjustedY, message: msg });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Close context menu and dropdown on click outside or Escape key press
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close context menu if click is outside
      if (contextMenu.visible && menuRef.current && !menuRef.current.contains(e.target)) {
        closeContextMenu();
      }

      // Close dropdown menu if click is outside
      if (selectedMessage && menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    const handleEscapeKey = (e) => {
      // Close both menus if the Escape key is pressed
      if (e.key === 'Escape') {
        if (contextMenu.visible) closeContextMenu();
        if (selectedMessage) closeMenu();
      }
    };

    // Attach listeners to the document
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [contextMenu.visible, selectedMessage]); // Dependency on both menus' visibility


  if (isLoading) {
    return <Spinner />
  }


  return (
    <div className="chat-interface" style={{ height: 'calc(100vh - 138px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        className="chat-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          borderBottom: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <div>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>
            {friend.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', transition: 'color 0.3s ease' }}>
          <span
            style={{
              marginLeft: '10px',
              fontWeight: '500',
              color: friendStatus === 'online' ? '#007bff' : '#808080',
              transition: 'color 0.3s ease, background-color 0.3s ease',
              padding: '4px 8px',
              borderRadius: '15px',
              backgroundColor: friendStatus === 'online' ? 'rgba(0, 123, 255, 0.1)' : 'rgba(128, 128, 128, 0.1)',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
              textTransform: 'capitalize',
              fontSize: '13px',
            }}
          >
            {friendStatus}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto', // Enable vertical scrolling
          border: '1px solid #eee',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {Object.keys(groupedMessages).map((date, idx) => (
          <div key={idx}>
            {/* Date Header */}
            <div
              style={{
                textAlign: 'center',
                padding: '10px 0',
                color: '#888',
                fontSize: '12px',
              }}
            >
              {date}
            </div>

            {/* Messages for that date */}
            {groupedMessages[date].map((msg, index) => {
              const isCurrentSender = msg.senderId === friend._id;

              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    margin: '5px 0',
                    display: 'flex',
                    justifyContent: isCurrentSender ? 'flex-start' : 'flex-end',
                    alignItems: 'center',
                    
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isCurrentSender ? 'whitesmoke' : '#63afff',
                      color: 'black',
                      padding: '5px 10px',
                      borderRadius: '10px',
                      maxWidth: '60%',
                      wordWrap: 'break-word',
                      display: 'flex',        // Use flexbox to align message text and three dots horizontally
                      justifyContent: 'space-between', // Ensure spacing between the text and the three dots
                      alignItems: 'center',
                    }}
                    onContextMenu={(e) => handleContextMenu(e, msg)} // Handle right-click
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '8px', color: 'black', marginTop: '5px', marginLeft: '5px' }}>
                      {formatTime(msg.createdAt)}
                    </div>

                    {/* Three Dots for Dropdown Menu */}
                    <div
                      onClick={() => toggleMenu(msg)} // Handle click to show/hide menu for specific message
                      style={{
                        cursor: 'pointer',
                        fontSize: '16px', // Adjust the size of the three dots
                        marginLeft: '10px',
                        color:'black', // Color for dots depending on message background
                      }}
                    >
                      ⋮
                    </div>

                    {/* Dropdown Menu */}
                    {selectedMessage === msg._id && (
                      <div
                        ref={menuRef} // Attach the ref to the dropdown menu for outside click detection
                        style={{
                          position: 'absolute',    // Change to absolute positioning
                          top: '100%',             // Position directly below the three dots
                          left: isCurrentSender ? '0' : 'auto',  // Align right for sent messages
                          right:isCurrentSender ? 'auto' : '0',    // Align left for received messages
                          backgroundColor: 'white',
                          
                          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                          padding: '5px',
                          borderRadius: '5px',
                          zIndex: 1000,            // Ensure it appears on top
                        }}
                      >
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                          <li
                            style={{ padding: '5px 0', cursor: 'pointer', fontSize: '12px' }}
                            onClick={() => {
                              handleDeleteMessage(msg); // Delete message action
                              closeMenu(); // Close menu after action
                            }}
                          >
                            Delete Message
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {/* Reference to ensure automatic scroll */}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', marginTop: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: '10px', marginRight: '10px', border: '1px solid', borderRadius: '6px' }}
          placeholder="Type a message..."
        />
        <button className="btn" type="submit" style={{ padding: '10px' }}>Send</button>
      
      </form>
      <div ref={messagesEndRef}></div>
    </div>
  );
};

export default ChatInterface;
