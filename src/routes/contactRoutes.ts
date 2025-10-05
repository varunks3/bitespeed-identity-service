import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';

const router = Router();
const contactController = new ContactController();

// POST /identify - Main endpoint for contact identification
router.post('/identify', (req, res) => contactController.identify(req, res));

// GET /health - Health check endpoint
router.get('/health', (req, res) => contactController.health(req, res));

export default router;
