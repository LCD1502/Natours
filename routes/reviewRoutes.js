const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
// use this code to get access to other routes parameter, because each route has param itself

// --- PROTECTED ROUTES ---
router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'), reviewController.setTourAndUserIds, reviewController.createReview);

router
    .route('/:id/')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);
module.exports = router;
