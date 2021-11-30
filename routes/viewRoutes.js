const express = require('express');

const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

router.use(authController.isLoggedIn);

router.get('/', viewController.getHome);
router.get('/all-tours', viewController.getOverview);
router.get('/about-us', viewController.getAboutUs);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);

router.get('/me', authController.protect, viewController.getAccount);

module.exports = router;
