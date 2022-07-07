import express, { Router } from 'express';
import { middlewares } from '../middlewares';
import { logExceptions } from '../middlewares/logger';

const router: Router = express.Router();

// middleware to use for all requests
router.use(middlewares);

// Error handling middleware must go last
router.use(logExceptions);

export { router };
