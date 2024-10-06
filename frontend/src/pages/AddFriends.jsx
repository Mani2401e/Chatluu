import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCheck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  searchUsers,
  getSearchHistory,
  updateSearchHistory,
  sendFriendRequest,
  getFriendsList,
} from '../features/chats/chatSlice';
import Spinner from '../components/LoadingSpinner';

function AddFriends() {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [DropdownOpen, setDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRequestSent, setIsRequestSent] = useState(false); // Track if the request is sent
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const { searchHistory, friendRequestsSent, isError } = useSelector((state) => state.chats);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const searchResults = useSelector((state) => state.chats.searchResults);
  const friendsList = useSelector((state) => state.chats.friendsList); // Get friends list from Redux
  // const isLoading = useSelector((state) => state.chats.isLoading);

  useEffect(() => {
    // Fetch the friends list when the component mounts
    dispatch(getFriendsList());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm.trim()) {
      dispatch(searchUsers(searchTerm));
      if (DropdownOpen === true) {
        setIsDropdownVisible(true);
      }
    } else if (searchTerm === '' && document.activeElement === inputRef.current) {
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
    }
  }, [searchTerm, DropdownOpen, dispatch]);

  // Filter searchResults and searchHistory to remove friends already in friendsList
  const filteredSearchResults = searchResults.filter(
    (result) => !friendsList.some((friend) => friend._id === result._id)
  );

  const filteredSearchHistory = searchHistory.filter(
    (historyItem) => !friendsList.some((friend) => friend._id === historyItem._id)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current !== event.target
      ) {
        closeDropdown(); // Close the dropdown when clicking outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeDropdown = () => {
    setDropdownOpen(false);
    setIsDropdownVisible(false);
  };

  const handleSearchChange = (e) => {
    setDropdownOpen(true);
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1); // Reset the index to default
  };

  const handleKeyDown = (e) => {
    const list = filteredSearchResults.length > 0 ? filteredSearchResults : filteredSearchHistory;

    setIsDropdownVisible(true);

    if (e.key === 'ArrowDown') {
      e.preventDefault(); // Prevent cursor movement
      setHighlightedIndex((prevIndex) =>
        prevIndex < list.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); // Prevent cursor movement
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : list.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      const selectedFriend = list[highlightedIndex];
      if (selectedFriend) {
        handleItemClick(selectedFriend);
        setSearchTerm(selectedFriend.name);
        setSelectedUser(selectedFriend);
        closeDropdown(); // Close the dropdown after selecting a user
      }
    }
  };

  const handleItemClick = async (receiver) => {
    try {
      setSearchTerm(receiver.name);
      setSelectedUser(receiver);
      closeDropdown(); // Close the dropdown after selecting an item

      // Check if receiver is already in searchHistory
      if (!searchHistory.some((historyItem) => historyItem.name === receiver.name) && receiver.name !== '') {
        await dispatch(updateSearchHistory(receiver));
        await dispatch(getSearchHistory());
      }

      // Check if a friend request has already been sent
      if (friendRequestsSent) {
        const isRequestInSearchResults = filteredSearchResults?.some(
          (friend) => friend?._id && receiver?._id && friend._id.toString() === receiver._id.toString()
        );

        const isRequestInSearchHistory = filteredSearchHistory?.some(
          (friend) => friend?._id && receiver?._id && friend._id.toString() === receiver._id.toString()
        );

        const existingRequest = friendRequestsSent.find(
          (request) =>
            request?.recipient?._id && (
              (isRequestInSearchResults && request.recipient._id.toString() === receiver._id.toString()) ||
              (isRequestInSearchHistory && request.recipient._id.toString() === receiver._id.toString())
            )
        );

        if (existingRequest) {
          setIsRequestSent(true);
        } else {
          setIsRequestSent(false);
        }
      } else {
        setIsRequestSent(false);
      }
    } catch (error) {
      console.error('Error in handleItemClick:', error);
    }
  };

  const handleFocus = () => {
    try {
      if (searchTerm === '') {
        setDropdownOpen(true);
        dispatch(getSearchHistory());
        setIsDropdownVisible(true);
      }
    } catch (error) {
      console.log('error focus : ', error.message);
    }
  };

  const handleAddFriend = async (recipientFriend) => {
    try {
      await dispatch(sendFriendRequest(recipientFriend._id));
      setIsRequestSent(true); // Set state to true when request is successfully sent
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };
  // if (isLoading) {
  //   return <Spinner />;
  // }

  return (
    <section className="add-friend-section">
      <div className="add-friend-watermark"></div>
      <div
        className="search-container"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
          paddingTop: '20px',
        }}
      >
        <div
          className="search-box"
          style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search friends"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className="search-bar"
            style={{ width: '500px' }}
          />
          <FaSearch
            className="search-icon"
            style={{
              position: 'absolute',
              right: '10px',
              fontSize: '20px',
              color: '#888',
              pointerEvents: 'none',
            }}
          />
          {isDropdownVisible && (
            <div
              className="search-results"
              style={{
                position: 'absolute',
                top: '40px',
                width: '500px',
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: '5px',
                zIndex: 2,
                height: `calc(98vh - ${inputRef.current?.getBoundingClientRect().bottom}px)`,
                overflowY: 'auto',
              }}
              ref={dropdownRef}
            >
              {searchTerm.trim() ? (
                filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((friend, index) => (
                    <div
                      key={friend._id || index}
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor:
                          highlightedIndex === index ? '#f0f0f0' : 'transparent', // Highlight on key press
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)} // Mouse hover highlighting
                      onMouseLeave={() => setHighlightedIndex(-1)} // Reset highlight on mouse leave
                      onClick={() => handleItemClick(friend)}
                    >
                      {friend.name}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: '10px',
                      textAlign: 'center',
                      color: '#888',
                    }}
                  >
                    No results found
                  </div>
                )
              ) : filteredSearchHistory.length > 0 ? (
                filteredSearchHistory.map((historyItem, index) => (
                  <div
                    key={historyItem._id || index}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      backgroundColor:
                        highlightedIndex === index ? '#f0f0f0' : 'transparent', // Highlight on key press
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)} // Mouse hover highlighting
                    onMouseLeave={() => setHighlightedIndex(-1)} // Reset highlight on mouse leave
                    onClick={() => handleItemClick(historyItem)}
                  >
                    {historyItem.name}
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    color: '#888',
                  }}
                >
                  No search history found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {selectedUser && (
        <div
          className="selected-user-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          <div
            className="add-friend-container"
            style={{
              backgroundColor: '#f9f9f9', // Light background for card effect
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Soft shadow for effect
              width: '400px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333', // Darker text for better readability
              }}
            >
              {selectedUser.name}
            </span>
            <button
              className="btn"
              onClick={() => handleAddFriend(selectedUser)}
              disabled={isRequestSent}
              style={{
                backgroundColor: isRequestSent ? '#e0ffe0' : '#007bff',
                color: isRequestSent ? '#28a745' : '#fff',
                border: 'none',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '5px',
                cursor: isRequestSent ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
              }}
            >
              {isRequestSent ? (
                <>
                  <FaCheck style={{ color: '#28a745', marginRight: '5px' }} />{' '}
                  Friend Request Sent
                </>
              ) : (
                'Add Friend'
              )}
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

export default AddFriends;
