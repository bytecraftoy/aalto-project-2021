import express, { Router } from 'express';
import { middlewares } from '../middlewares';

const router: Router = express.Router();

// middleware to use for all requests
router.use(middlewares);

export { router };
