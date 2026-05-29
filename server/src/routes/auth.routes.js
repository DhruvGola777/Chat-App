import express from 'express';
import { checkAuth, login, logout, signup, updateProfile } from '../controller/user.controller.js';
import { protectRoutes } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/check', protectRoutes, checkAuth);
router.patch('/update-profile', protectRoutes, updateProfile);
router.post('/logout', protectRoutes, logout);


export default router;