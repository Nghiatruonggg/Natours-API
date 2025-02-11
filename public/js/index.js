import '@babel/polyfill';
import { login, logout } from './auth';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';

// DOM Elements
const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logoutButton = document.getElementById('logout-function');
const updatedUserForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}

if (updatedUserForm) {
  updatedUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    updateSettings({ name, email }, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').innerHTML = 'Updating';
    const oldPassword = document.querySelector('#password-current').value;
    const newPassword = document.querySelector('#password').value;
    const confirmedPassword = document.querySelector('#password-confirm').value;
    await updateSettings(
      { oldPassword, newPassword, confirmedPassword },
      'password'
    );

    document.querySelector('.btn--save-password').innerHTML = 'Save password';
    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
  });
}
