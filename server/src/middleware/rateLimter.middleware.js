import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { ApiResponse } from '../utils/ApiResponse.js';

export const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Max 3 OTP requests
  keyGenerator: (req) => {
    // Use email if available and valid, fallback to IP with IPv6 protection
    const email = req.body?.email;
    if (email && typeof email === 'string' && email.trim()) {
      return email.toLowerCase();
    }

    // Use ipKeyGenerator instead of req.ip directly
    return ipKeyGenerator(req.ip);
  },
  handler: (req, res) => {
    res.status(429).json(new ApiResponse(
      429,
      null,
      "Too many OTP requests. Please wait 10 minutes before requesting again."
    ));
  },
  standardHeaders: true, // Provides rate limit info in response headers
  skipFailedRequests: false, // Count failed requests (recommended for security)
});


export const imageGenratorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    const specialEmail = process.env.GMAIL_USER?.toLowerCase();
    const userEmail =
      (req.user?.email || req.body?.email || '').toLowerCase();
    return userEmail === specialEmail ? 100 : 10;
  },
  keyGenerator: (req) => {
    const email = req.body?.email;
    if (email && typeof email === 'string' && email.trim()) {
      return email.toLowerCase();
    }
    // Use ipKeyGenerator for IPv6-aware IP fallback
    return ipKeyGenerator(req.ip);
  },
  handler: (req, res) => {
    res
      .status(429)
      .json(new ApiResponse(429, null, "Too many image generation requests. Try again later."));
  },
  standardHeaders: true,   // (Optional) recommended: adds RateLimit-* headers
  legacyHeaders: false,    // (Optional) disables deprecated X-RateLimit-* headers
});

