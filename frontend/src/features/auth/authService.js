import axios from 'axios'

const API_URL = '/chatluu/users/';

// Register user
const register = async (userData) => {
  
  try {
    const response = await axios.post(API_URL + 'register', userData); // error markup

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    let errorMessage = error.message;

    if (error.response && error.response.data) {
      errorMessage = error.response.data.message; // Assuming the server responds with a message property
    }

    throw new Error(errorMessage); // Throwing a new error with the message
  }
}

// Login user
const login = async (userData) => {

  try {
    const response = await axios.post(API_URL + 'login', userData)
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }

  return response.data
  } catch (error) {
    let errorMessage = error.message;

    if (error.response && error.response.data) {
      errorMessage = error.response.data.message; // Assuming the server responds with a message property
    }

    throw new Error(errorMessage); // Throwing a new error with the message
  }
  
}

// Logout user
const logout = () => {
  localStorage.removeItem('user')
}

const authService = {
  register,
  logout,
  login,
}

export default authService
