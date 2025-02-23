import '@babel/polyfill';
import { login, logout } from './auth';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// DOM Elements
const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logoutButton = document.getElementById('logout-function');
const updatedUserForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// Delegation
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
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.querySelector('#photo').files[0]);
    updateSettings(form, 'data');
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

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing!';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
