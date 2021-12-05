/* eslint-disable */

const form = document.querySelector('.form-control');
const departing = document.querySelector('.departing');
const difficulty = document.querySelector('.difficulty');
const price = document.querySelector('.price');
const maxGr = document.querySelector('.maxGr');
form.onclick = () => {
    const index = form.selectedIndex;
    switch (index) {
        case 0:
            departing.innerText = '05/08/2022';
            difficulty.innerText = 'difficult';
            maxGr.innerText = 10;
            price.innerText = '$ ' + 997;
            break;
        case 1:
            departing.innerText = '25/04/2022';
            difficulty.innerText = 'easy';
            maxGr.innerText = 25;
            price.innerText = '$ ' + 397;
            break;
        case 2:
            departing.textContent = '19/06/2022';
            difficulty.textContent = 'medium';
            maxGr.textContent = 15;
            price.textContent = '$ ' + 497;
            break;
        case 3:
            departing.textContent = '05/08/2022';
            difficulty.textContent = 'medium';
            maxGr.textContent = 8;
            price.textContent = '$ ' + 2997;
            break;
        case 4:
            departing.textContent = '23/03/2022';
            difficulty.textContent = 'difficult';
            maxGr.textContent = 10;
            price.textContent = '$ ' + 997;
            break;
        case 5:
            departing.textContent = '11/03/2022';
            difficulty.textContent = 'ease';
            maxGr.textContent = 20;
            price.textContent = '$ ' + 1197;
            break;
        case 6:
            departing.textContent = '19/07/2022';
            difficulty.textContent = 'difficult';
            maxGr.textContent = 8;
            price.textContent = '$ ' + 2997;
            break;
        case 7:
            departing.textContent = '05/08/2022';
            difficulty.textContent = 'medium';
            maxGr.textContent = 15;
            price.textContent = '$ ' + 1497;
            break;
        case 8:
            departing.textContent = '16/12/2022';
            difficulty.textContent = 'easy';
            maxGr.textContent = 12;
            price.textContent = '$ ' + 1497;
            break;
    }
};
