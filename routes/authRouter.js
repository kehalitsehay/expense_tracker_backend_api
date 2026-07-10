import { Router } from 'express'
import rateLimit from 'express-rate-limit';
import { authenticatedToken } from '../src/database/middleware/authMiddleware.js';
import { register, login, getAllUsers, getById, updateBudget } from '../controlles/authController.js'

const router = Router()

// Strict Limiter for Login (5 attempts per 15 minutes)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, 
    message: { error: "Too many login attempts from this IP. Please try again after 15 minutes." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

// Slightly softer limiter for registration (10 accounts per hour per IP)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: "Too many accounts created from this IP. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.get('/', getAllUsers)
router.get('/:id', getById)
router.get('/budget', authenticatedToken, updateBudget)

export default router