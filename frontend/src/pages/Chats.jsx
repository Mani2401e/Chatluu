import React, { useEffect, useState } from 'react';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import { getAllMessages, getFriendsList } from '../features/chats/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import ChatInterface from './ChatInterface';
import Spinner from '../components/LoadingSpinner';

function Chats() {
  const dispatch = useDispatch(); 
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const friendsList = useSelector((state) => state.chats.friendsList);
  const messagesList = useSelector((state) => state.chats.messages);
  const { isLoading } = useSelector((state) => state.chats.isLoading);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getFriendsList());
    const userId = user._id.toString(); // Replace with the actual user ID from your state/auth

  }, [dispatch, user]);
  
  const filteredFriends = friendsList.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFocus = () => {
    setIsInputFocused(true);
  };

  const handleBlur = () => {
    setIsInputFocused(false);
  };

  const handleKeyDown = (e) => {
    if (!isInputFocused) return; 

    if (e.key === 'Escape') {
      setSelectedIndex(-1); 
    } else if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) => Math.min(prevIndex + 1, friendsList.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  };

  const handleClick = (index, friend) => {
    dispatch(getAllMessages(friend._id));
    setSelectedIndex(selectedIndex === index ? -1 : index); 
    setHighlightedIndex(-1); 
  };

  
  const getLastMessage = (friendId) => {
    // console.log("messagesList", messagesList.messages);

    if (!messagesList.messages) {
      return { text: '', isSent: false }; // Return empty if no message found
    }
    else{

      // Filter messages for the conversation with the friend
      const lastMessage = messagesList.messages
      .filter(msg => msg.senderId === friendId || msg.recipientId === friendId)
      .slice(-1)[0]; // Get the last message
    
      if (!lastMessage) {
        return { text: '', isSent: false }; // Return empty if no message found
      }
      // Determine if the last message was sent by the logged-in user      
      const isSent = lastMessage.senderId === user._id;
      return { text: lastMessage.text, isSent };
    }

  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className='chats-container' onKeyDown={handleKeyDown} tabIndex="0">
      <div className='left-part'>
        <div className='search-container'>
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchTerm}
            onFocus={handleFocus}
            onBlur={handleBlur} 
            onChange={handleSearchChange}
            className='search-bar'
          />
          <FaSearch className='search-icon' style={{ position: 'absolute', right: '10px', fontSize: '20px', color: '#888', pointerEvents: 'none' }} />
        </div>

        <div className='chatlists-container'>
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend, index) => {
              const lastMessageData = getLastMessage(friend._id); 
              return (
                <div
                  className={`user-chats ${selectedIndex === index ? 'highlight' : ''}`}
                  key={friend._id || index}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                  onClick={() => { handleClick(index, friend); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleClick(index, friend);
                    }
                  }}
                  style={{
                    backgroundColor: highlightedIndex === index && selectedIndex === -1 ? '#f0f0f0' : selectedIndex === index ? '#d0e0f0' : 'white',
                    display: 'flex',
                    padding: '10px',
                    alignItems: 'center',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  tabIndex="0"
                >
                  <div className='user-icon-container' style={{ marginRight: '10px' }}>
                    <FaUserCircle style={{ fontSize: '45px', color: '#9fc7f2' }} />
                  </div>

                  <div className='user-info' style={{ display: 'flex', flexDirection: 'column', width: 'calc(100% - 55px)' }}>
                    <div className='user-name-container' style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                      {friend.name}
                    </div>

                    <div className='user-message-container' style={{
                      fontSize: '12px',
                      color: '#888',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                    }}>
                      {lastMessageData.isSent && (
                        <span style={{ fontSize: '14px', color: '#888', marginLeft: '5px', marginRight: '5px' }}>✓</span>
                      )}
                      <span style={{ fontSize:'15px' , flex: 1 }}>{lastMessageData.text}</span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ padding: '10px', textAlign: 'center', color: '#888' }}>
              No results found
            </div>
          )}
        </div>
      </div>

      <div className='right-part'>
        {selectedIndex !== -1 ? (
          <ChatInterface friend={filteredFriends[selectedIndex]} onClose={() => setSelectedIndex(-1)} />
        ) : (
          <div style={{ textAlign: 'center', color: '#888' }}>
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Chats;
