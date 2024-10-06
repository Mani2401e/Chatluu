import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { register, reset } from '../features/auth/authSlice';
import Spinner from '../components/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Ensure to import icons

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  const { name, email, password, password2 } = formData;
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message); // Display error message using toast
    }

    if (isSuccess || user) {
      toast.success('Registration successful!'); // Optional success message
      navigate('/profile');
    }

    dispatch(reset()); // Reset auth state when component mounts or unmounts
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (!name || !email || !password || !password2) {
      toast.error('Please fill in all fields'); // Display error if any field is empty
      return;
    }

    if (password !== password2) {
      toast.error('Passwords do not match'); // Display password mismatch error
    } else {
      const userData = {
        name,
        email,
        password,
      };
      dispatch(register(userData));
    }
  };

  const togglePasswordVisibility1 = () => {
    setShowPassword1((prev) => !prev); // Toggle password visibility
  };

  const togglePasswordVisibility2 = () => {
    setShowPassword2((prev) => !prev); // Toggle password visibility
  };

  // if (isLoading && isError) {
  //   return <Spinner />;
  // }

  return (
    <>
      <ToastContainer /> {/* Keep for notifications */}
      
      <section className='heading'>
        <p>Please create an account</p>
      </section>

      {message && <div style={{ fontSize: '12px', color: 'red', margin: '10px 0', fontWeight: 'bold' }}>{message}</div>}

      <section className='form'>
        <form onSubmit={onSubmit}>
          <div className='form-group'>
            <input
              type='text'
              className='form-control'
              id='name'
              name='name'
              value={name}
              placeholder='Enter your name'
              onChange={onChange}
              required
            />
          </div>
          <div className='form-group'>
            <input
              type='email'
              className='form-control'
              id='email'
              name='email'
              value={email}
              placeholder='Enter your email'
              onChange={onChange}
              required
            />
          </div>
          <div className='form-group' id='password-container'>
            <input
              type={showPassword1 ? 'text' : 'password'} // Toggle between text and password
              className='form-control'
              id='password'
              name='password'
              value={password}
              placeholder='Enter password'
              onChange={onChange}
              required
            />
            <button className='show-password' type='button' onClick={togglePasswordVisibility1}>
              <FontAwesomeIcon icon={showPassword1 ? faEye : faEyeSlash} />
            </button>
          </div>

          <div className='form-group' id='password-container'>
            <input
              type={showPassword2 ? 'text' : 'password'} // Toggle between text and password
              className='form-control'
              id='password2'
              name='password2'
              value={password2}
              placeholder='Confirm password'
              onChange={onChange}
              required
            />
            <button className='show-password' type='button' onClick={togglePasswordVisibility2}>
              <FontAwesomeIcon icon={showPassword2 ? faEye : faEyeSlash} />
            </button>
          </div>

          <div className='form-group'>
            <button type='submit' className='btn wide-btn'>
              Submit
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export default Register;
