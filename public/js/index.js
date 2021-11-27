/* eslint-disable */
import '@babel/polyfill';

import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateData, updatePassword } from './updateSettings';

const mapBox = document.getElementById('map');
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

const loginForm = document.querySelector('.form--login');
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

const userDataForm = document.querySelector('.form-user-data');
if (userDataForm)
    userDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateData(form);
    });

const changePasswordForm = document.querySelector('.form-user-password ');
if (changePasswordForm)
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        document.querySelector('.btn--save-password').textContent = 'Updating....';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirmation = document.getElementById('password-confirm').value;
        await updatePassword(passwordCurrent, password, passwordConfirmation);

        document.querySelector('.btn--save-password').textContent = 'Save Password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
