const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const githubController = require('../controllers/githubController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/profile', jwtMiddleware, authController.profile);

router.get('/github', githubController.redirectToGithub);
router.get('/github/callback', githubController.handleCallback);

module.exports = router;