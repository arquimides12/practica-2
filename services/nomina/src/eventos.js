// Suscriptor de eventos asincronos en Redis (Pub/Sub)
// Si REDIS_URL no esta definido, el servicio funciona igual sin escuchar eventos.
const { createClient } = require('redis');

async function suscribir(canal, manejador) {
  if (!process.env.REDIS_URL) return;
  const sub = createClient({ url: process.env.REDIS_URL });
  sub.on('error', err => console.error('Error Redis:', err.message));
  await sub.connect();
  await sub.subscribe(canal, mensaje => manejador(JSON.parse(mensaje)));
  console.log(`Nomina suscrito a Redis, canal ${canal}`);
}

module.exports = { suscribir };
