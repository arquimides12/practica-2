# rrhh-soa - Sistema de Gestion de RRHH con Arquitectura Orientada a Servicios

Practica 2 - Arquitectura de Software (NRC 32828) - Anderson Campos

## Componentes

| Componente | Carpeta | Puerto | Base de datos |
|---|---|---|---|
| API Gateway (ESB) | `gateway/` | 3000 | - |
| Servicio Empleados | `services/empleados/` | 3001 | PostgreSQL (`postgres_emp`) |
| Servicio Nomina | `services/nomina/` | 3002 | PostgreSQL (`postgres_nom`) |
| Servicio Reclutamiento | `services/reclutamiento/` | 3003 | MongoDB (`mongo`) |
| Mensajeria asincrona | `redis` | interno | Redis Pub/Sub |
| Monitoreo | `prometheus/` | 9090 | Prometheus |

## Ejecucion (Docker)

```
docker compose up --build
```

El sistema esta listo cuando aparecen los mensajes:
`Servicio Empleados en http://localhost:3001`, `Servicio Nomina en http://localhost:3002`,
`Servicio Reclutamiento en http://localhost:3003` y `Gateway corriendo en http://localhost:3000`.

Detener: `docker compose down` (con `-v` tambien borra los datos).

## Pruebas

Abrir `pruebas.http` en VS Code con la extension REST Client y ejecutar cada peticion en orden.
Prometheus: http://localhost:9090 (Status > Targets, y consultar `gateway_http_requests_total`).

## Cambios respecto al codigo de la guia

1. **Gateway (`gateway/src/index.js`)**: con `http-proxy-middleware` 2.x el proxy reenviaba la ruta
   completa (`/api/empleados`) y los servicios respondian 404; se agrego `pathRewrite: { '^/api': '' }`.
   Ademas `express.json()` consumia el body y los POST/PUT quedaban colgados; se agrego
   `onProxyReq: fixRequestBody`. El manejador de errores pasa de `on: { error }` (sintaxis v3) a `onError` (v2).
2. **Mensajeria asincrona (objetivo 4)**: Empleados publica el evento `empleado.creado` en Redis y
   Nomina lo recibe por suscripcion (`src/eventos.js` en cada servicio).
3. **Metricas (objetivo 4)**: el Gateway expone `/metrics` con `prom-client` y Prometheus lo consulta cada 5 s.
4. **Calculo de nomina (`services/nomina/src/index.js`)**: el valor de la hora extra se redondeaba antes de
   multiplicarlo por las horas (5 x 9.38 = 46.90) y el neto daba 1579.40. Ahora se redondea solo al final
   (5 x 9.375 = 46.88) y el neto es 1579.38, como indica la guia.
