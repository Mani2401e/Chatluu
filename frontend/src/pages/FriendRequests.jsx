import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFriendRequestsReceived, acceptFriendRequest, rejectFriendRequest, getFriendsList } from '../features/chats/chatSlice';
import Spinner from '../components/LoadingSpinner';

function FriendRequests() {
  const [isRequestReceived, setIsRequestReceived] = useState(false); 
  const [acceptedRequests, setAcceptedRequests] = useState([]); 
  const [rejectedRequests, setRejectedRequests] = useState([]); 
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {  
    dispatch(getFriendRequestsReceived());
  }, [dispatch]);

  const { friendRequestsReceived } = useSelector((state) => state.chats);
  const { isLoading } = useSelector((state) => state.chats.isLoading);

  useEffect(() => {
    if (!friendRequestsReceived || !user) return;
    
    // Check if there are any friend requests for the user, excluding rejected ones
    const hasRequestsForUser = friendRequestsReceived.some(
      request => request.recipient === user._id && !rejectedRequests.includes(request.sender._id)
    );
    setIsRequestReceived(hasRequestsForUser);
    
  }, [friendRequestsReceived, user, rejectedRequests]); // Add rejectedRequests to the dependency array

  const handleAccept = (requestId) => {
    dispatch(acceptFriendRequest(requestId));
    dispatch(getFriendsList());
    setAcceptedRequests(prev => [...prev, requestId]);
  };

  const handleReject = (requestId) => {
    dispatch(rejectFriendRequest(requestId));
    dispatch(getFriendsList());
    setRejectedRequests((prev) => [...prev, requestId]); 

    // Check if there are any remaining requests for the user
    const remainingRequests = friendRequestsReceived.filter(
      request => request.recipient === user._id && !rejectedRequests.includes(request.sender._id)
    );

    // If no remaining requests, update isRequestReceived
    if (remainingRequests.length === 0) {
      setIsRequestReceived(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <div className={`friend-requests-message ${isRequestReceived ? 'pending' : 'no-requests'}`}>
        {isRequestReceived ? 'Friend Requests Waiting for You' : 'All Caught Up—No New Friend Requests'}
      </div>

      {isRequestReceived && (
        <div className='friend-request-main-container'>
          <div className='friend-request-container'>
            {friendRequestsReceived
              .filter(request => request.recipient === user._id && !rejectedRequests.includes(request.sender._id))
              .map(request => (
                <div key={request.sender._id} className={`friend-request-item ${acceptedRequests.includes(request.sender._id) ? 'accepted' : ''} ${rejectedRequests.includes(request.sender._id) ? 'rejected' : ''}`}>
                  <span className='sender-name'>{request.sender.name}</span>
                  {!acceptedRequests.includes(request.sender._id) && !rejectedRequests.includes(request.sender._id) && (
                    <div className="button-group">
                      <button
                        className='accept-button'
                        onClick={() => handleAccept(request.sender._id)}
                      >
                        Accept
                      </button>
                      <button
                        className='reject-button'
                        onClick={() => handleReject(request.sender._id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {acceptedRequests.includes(request.sender._id) && (
                    <span className='request-accepted-message'>Request Accepted</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
      
    </>
  );
}

export default FriendRequests;
