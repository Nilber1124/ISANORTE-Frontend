// Destino de /api en `ng serve`. Por defecto el backend local; para probar contra
// el desplegado usa `npm run start:render` (define BACKEND_TARGET).
const target = process.env.BACKEND_TARGET || 'http://localhost:8080';

module.exports = {
  '/api': {
    target,
    secure: target.startsWith('https://'),
    changeOrigin: true,
  },
};
