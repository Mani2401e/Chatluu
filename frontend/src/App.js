import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Chats from './pages/Chats';
import AddFriends from './pages/AddFriends';
import FriendRequests from './pages/FriendRequests';

function App() {
  const { user } = useSelector((state) => state.auth); // Getting the user authentication status from Redux

  return (
    <Router>
      <div className="container">
        <Header />

        <Routes>
          {/* Redirect to login if the user is not authenticated */}
          <Route path="/" element={!user ? <Navigate to="/login" /> : <Navigate to="/profile" />} />
          
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/profile" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/profile" />} />

          {/* Private Routes - accessible only if authenticated */}
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/chats" element={user ? <Chats /> : <Navigate to="/login" />} />
          <Route path="/add-friends" element={user ? <AddFriends /> : <Navigate to="/login" />} />
          <Route path="/friend-requests" element={user ? <FriendRequests /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
