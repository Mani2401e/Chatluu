import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login, reset } from '../features/auth/authSlice';
import { resetChat,updateStatus,getFriendRequestsSent,getFriendRequestsReceived, getSearchHistory, getFriendsList} from '../features/chats/chatSlice';
import Spinner from '../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Ensure to import icons


function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth);
  

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (user) {

      dispatch(getFriendRequestsSent());
      dispatch(getSearchHistory());
      dispatch(getFriendsList());
      dispatch(getFriendRequestsReceived());
      navigate('/profile');  // Redirect to profile after successful login
    }

    dispatch(reset());
    dispatch(resetChat());
    
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Toggle password visibility
  };

  // if (isLoading) {
  //   return <Spinner />;
  // }

  return (
    <>

      <ToastContainer /> 
      <section className='heading'>
        <p>Login to your account</p>
      </section>

      <section className='form'>
        <form onSubmit={onSubmit}>
          <div className='form-group'>
            <input
              type='email'
              className='form-control'
              id='email'
              name='email'
              placeholder='Enter your email'
              onChange={onChange}
              required
            />
          </div>
          <div className='form-group' id = 'password-container'>
            <input
              type='password'
              className='form-control'
              id='password'
              name='password'
              placeholder='Enter password'
              onChange={onChange}
              required
            />

            <button className='show-password' type='button' onClick={togglePasswordVisibility}>
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </button>
          </div>
          <div className='form-group'>
            <button type='submit' className='btn wide-btn' id='submitbtn'>
              Submit
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export default Login;
