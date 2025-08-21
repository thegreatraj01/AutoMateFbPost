import express from 'express';
import { getAdminHistory, getUserHistory } from '../controllers/history.controller.js';
import { verifyAdmin, verifyJWT } from '../middleware/auth.middleware.js'
const historyRouter = express.Router();


// GET api/v1/history/user 
historyRouter.get('/user', verifyJWT, getUserHistory);

// GET api/v1/history/admin
historyRouter.get('/admin', verifyJWT, verifyAdmin, getAdminHistory); // Uncomment and implement if



export default historyRouter;