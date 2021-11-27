/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
//update data

export const updateData = async (data) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateMe',
            data,
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Data updated successfully!!!');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const updatePassword = async (passwordCurrent, password, passwordConfirmation) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateMyPassword',
            data: {
                passwordCurrent,
                password,
                passwordConfirmation,
            },
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Password updated successfully!!!');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
