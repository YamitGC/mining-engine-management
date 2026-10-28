import rateLimit from 'express-rate-limit';

// Limitador estricto para el login contra ataques de fuerza bruta
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'test' ? 1000 : 10, // Máximo 10 intentos por IP en 15 minutos
  standardHeaders: true, // Retorna cabeceras estándar RateLimit-*
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiados intentos de inicio de sesión desde esta IP. Por favor intente nuevamente en 15 minutos.'
  }
});

// Limitador general para la API
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 2000 : 100, // 100 peticiones por cada 15 min
  standardHeaders: true,
  legacyHeaders: false
});
