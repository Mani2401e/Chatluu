import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaComments, FaUserPlus, FaUserFriends, FaTimes } from 'react-icons/fa'; 
import {updateStatus, getSearchHistory, getFriendRequestsSent, getFriendsList, getFriendRequestsReceived, removeFriend } from '../features/chats/chatSlice'; 
import Modal from 'react-modal';
import Spinner from '../components/LoadingSpinner';

Modal.setAppElement('#root');

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [removedFriends, setRemovedFriends] = useState([]);

  const { user } = useSelector((state) => state.auth);
  const { friendsList, isLoading } = useSelector((state) => state.chats);

  useEffect(() => {
    dispatch(getFriendRequestsSent());
    dispatch(getSearchHistory());
    dispatch(getFriendsList());
    dispatch(getFriendRequestsReceived());
    dispatch(updateStatus({status: 'online'}));
  }, [dispatch]);

  const openModal = () => setIsFriendsModalOpen(true);
  const closeModal = () => setIsFriendsModalOpen(false);

  const handleRemoveFriend = (friendId) => {
    setRemovedFriends([...removedFriends, friendId]);
    dispatch(removeFriend(friendId));
  };

  // Show loading spinner if data is being fetched
  if (isLoading) {
    return <Spinner />;
  }

  // Check if friendsList is an array and not empty
  const hasFriends = Array.isArray(friendsList) && friendsList.length > 0;

  return (
    <>
      <section className='heading'> 
          <h1 className='shining-text'>Welcome, {user.name}!</h1>
      </section>

      <section>
        <div className="profile-features-container">
          <div className="icon-text">
            <Link to="/chats" className="nav-item">
              <FaComments size={30} className="icon" />
              <span>Chats</span>
            </Link>
          </div>

          <div className="icon-text">
            <Link to="/add-friends" className="nav-item">
              <FaUserPlus size={30} className="icon" />
              <span>Add Friend</span>
            </Link>
          </div>
          
          <div className="icon-text">
            <Link to="/friend-requests" className="nav-item">
              <FaUserFriends size={30} className="icon" />
              <span>Friend Requests</span>
            </Link>
          </div>

          {/* My Friends button */}
          <div className="icon-text">
            <button onClick={openModal} className="nav-item no-border-btn">
              <FaUserFriends size={30} className="icon" />
              <span>My Friends</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal for showing friends list */}
      <Modal 
        isOpen={isFriendsModalOpen} 
        onRequestClose={closeModal} 
        contentLabel="My Friends"
        style={{
          display: 'flex',
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)' 
          },
          content: {
            width: '500px', 
            margin: 'auto', 
            borderRadius: '10px',
            border: '1px solid #ccc',
            padding: '20px',
            position: 'relative'
          }
        }}
      >
        <button onClick={closeModal} className="modal-close-btn">
          <FaTimes size={20} />
        </button>
        <h2>List of Friends</h2>
        <div>
          {hasFriends ? ( // Check if there are friends to display
            <div>
                {friendsList.map((friend) => (
                  // Check if friend is defined
                  friend ? (
                    <li key={friend.id} className="friend-item" style={{ padding: '10px 0', borderBottom: '1px solid #ccc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{friend.name}</span>
                        {removedFriends.includes(friend._id) ? (
                          <span className="removed-text">Removed</span>
                        ) : (
                          <button
                            className="btn remove-btn"
                            onClick={() => handleRemoveFriend(friend._id)}
                            disabled={removedFriends.includes(friend._id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  ) : null // Render nothing if friend is undefined
                ))}

            </div>
          ) : (
            <p>You don't have any friends added yet.</p>
          )}
        </div>
      </Modal>
    </>
  );
}

export default Profile;
