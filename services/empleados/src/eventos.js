// Publicador de eventos asincronos en Redis (Pub/Sub)
// Si REDIS_URL no esta definido, el servicio funciona igual sin publicar eventos.
const { createClient } = require('redis');

let client = null;

async function conectar() {
  if (!process.env.REDIS_URL) return;
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', err => console.error('Error Redis:', err.message));
  await client.connect();
  console.log('Empleados conectado a Redis');
}

async function publicar(canal, datos) {
  if (!client || !client.isReady) return;
  await client.publish(canal, JSON.stringify(datos));
  console.log(`Evento publicado en ${canal}:`, JSON.stringify(datos));
}

module.exports = { conectar, publicar };
