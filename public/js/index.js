import '@babel/polyfill';
import { login, logout } from './auth';
import { displayMap } from './mapbox';

// DOM Elements
const loginForm = document.querySelector('.form');
const mapBox = document.getElementById('map');
const logoutButton = document.getElementById('logout-function');

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
