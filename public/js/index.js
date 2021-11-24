/* eslint-disable */
import '@babel/polyfill';

import { login, logout } from './login';
import { displayMap } from './mapbox';

const mapBox = document.getElementById('map');
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

const loginForm = document.querySelector('.form');
if (loginForm) {
    document.querySelector('.form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) logoutBtn.addEventListener('click', logout);
