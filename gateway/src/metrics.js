// Metricas operacionales para Prometheus (objetivo 4 de la guia)
const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'gateway_' });

const httpRequests = new client.Counter({
  name: 'gateway_http_requests_total',
  help: 'Total de peticiones atendidas por el Gateway',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpDuration = new client.Histogram({
  name: 'gateway_http_request_duration_seconds',
  help: 'Duracion de las peticiones en segundos',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

// Agrupa la ruta por servicio para no crear una serie por cada ID
const routeOf = url => {
  const m = url.match(/^\/api\/(empleados|nomina|reclutamiento)/);
  if (m) return `/api/${m[1]}`;
  return url.split('?')[0];
};

const middleware = (req, res, next) => {
  const end = httpDuration.startTimer();
  const url = req.originalUrl;
  res.on('finish', () => {
    const labels = { method: req.method, route: routeOf(url), status: res.statusCode };
    httpRequests.inc(labels);
    end(labels);
  });
  next();
};

module.exports = { register, middleware };
