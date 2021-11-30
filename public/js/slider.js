/* eslint-disable */
var counter = 1;
export const slideShow = setInterval(function () {
    const radioCounter = document.getElementById('radio' + counter);
    if (radioCounter) radioCounter.checked = true;
    counter++;
    if (counter > 3) {
        counter = 1;
    }
}, 4000);

// var slideIndex = 1;

// // Next/previous controls
// export const plusSlides = (n) => {
//     showSlides((slideIndex += n));
// };

// export const showSlides = (n) => {
//     var slide = document.querySelector('.slider-home');

//     if (n > 4) {
//         slideIndex = 1;
//     }
//     if (n < 1) {
//         slideIndex = 3;
//     }
//     slide.style.background = `url(../../img/tours/tour-${slideIndex}-3.jpg) bottom center / cover no-repeat`;
// };

// export const autoSlides = () => {
//     var slide = document.querySelector('.slider-home');
//     console.log(slide);
//     slideIndex++;
//     if (slideIndex > 4) {
//         slideIndex = 1;
//     }
//     slide.style.background = `url(../../img/tours/tour-${slideIndex}-3.jpg) bottom center / cover no-repeat`;
//     setTimeout(autoSlides, 4000); // Change image every 2 seconds
// };
