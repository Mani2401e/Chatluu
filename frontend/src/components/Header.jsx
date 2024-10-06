import { FaSign, FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import { updateStatus} from '../features/chats/chatSlice';
import Spinner from '../components/LoadingSpinner';
function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { isLoading } = useSelector((state) => state.auth.isLoading)
  const logoRef = useRef(null)
  const onLogin = () => {
    navigate('/login');
  }

  const onLogout = async () => {
    await dispatch(updateStatus({ status: 'offline' }));
    await dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };
  

  const onRegister = () => {
    navigate('/register');
  }



  const onDashboard = () => {
    if (user) {
      navigate('/profile');  
    } else {
      navigate('/login');
    }
  }
  const triggerWobble = () => {
    if (logoRef.current) {
      logoRef.current.classList.add('wobble');
      setTimeout(() => {
        logoRef.current.classList.remove('wobble');
      }, 500); // Remove wobble class after animation ends
    }
  };


  if (isLoading) {
    
    return <Spinner />;
  }


  return (
    <header className="header">
      <Link
        className="logo"
        to="/login"
        onClick={(e) => {
          triggerWobble();
          onDashboard();
        }}
        ref={logoRef}
      >
        Chat-luu
      </Link>

      <ul>
        {user ? (
          <li>
            <Link to = "/" onClick={onLogout}>
              <FaSignOutAlt /> Logout
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link to="/login" onClick={onLogin}>
                <FaSignInAlt /> Login
              </Link>
            </li>
            <li>
              <Link to="/register" onClick={onRegister}>
                <FaUser /> Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
}


export default Header
