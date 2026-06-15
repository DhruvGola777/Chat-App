import express from 'express';
import { deleteMessage, getMessages, getUserForSidebar, markMessagesAsSeen, sendMessages } from '../controller/message.controller.js';
import { protectRoutes } from '../middleware/auth.middleware.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoutes, getUserForSidebar);
messageRouter.get('/:id', protectRoutes, getMessages);
messageRouter.post('/send/:id', protectRoutes, sendMessages)
messageRouter.patch('/mark/:id', protectRoutes, markMessagesAsSeen);
messageRouter.delete('/delete/:id', protectRoutes, deleteMessage);

export default messageRouter;