const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const csrf = require('csrf');

// CSRF Protection
const csrfProtection = new csrf();

// Rate limiting
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Input validation middleware
const validateInput = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    next();
  };
};

// CSRF token generation
const generateCSRFToken = (req, res, next) => {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = csrfProtection.secretSync();
  }
  req.csrfToken = () => csrfProtection.create(req.session.csrfSecret);
  next();
};

// CSRF token verification
const verifyCSRFToken = (req, res, next) => {
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const secret = req.session.csrfSecret;
  
  if (!token || !secret || !csrfProtection.verify(secret, token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Common validation rules
const validationRules = {
  email: body('email').isEmail().normalizeEmail(),
  password: body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  id: body('id').isUUID(),
  text: body('text').trim().isLength({ min: 1, max: 1000 }),
  number: body('number').isNumeric(),
  date: body('date').isISO8601()
};

module.exports = {
  createRateLimit,
  validateInput,
  generateCSRFToken,
  verifyCSRFToken,
  securityHeaders,
  validationRules
};