import axios from 'axios';
import { showAlert, hideAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/login`,
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', `${error.response.data.message}`);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/users/logout`
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      if (location.pathname.startsWith('/me')) {
        return setTimeout(() => {
          location.assign('/');
        }, 1000);
      } else {
        return setTimeout(() => {
          location.reload(true);
        }, 1000);
      }
    }
  } catch (error) {
    console.log(error);
    showAlert('error', `Please try again`);
  }
};
