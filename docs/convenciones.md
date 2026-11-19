# Convenciones del proyecto

## Ramas

- `main`: versión estable.
- `development`: rama de integración. Todo trabajo parte de aquí y se mergea aquí mediante PR.
- `feat/<nombre>`: funcionalidades nuevas (ej. `feat/import-steam`).
- `fix/<nombre>`: correcciones.
- `docs/<nombre>`: documentación aislada.

Si una rama depende de otra que aún no se ha mergeado, créala desde esa rama y menciónalo en la descripción de la PR. Es una cadena temporal: se simplifica en cuanto la primera rama entra en `development`.

## Commits

Se usa Conventional Commits en español o inglés, con prefijos:

- `feat:` nueva funcionalidad.
- `fix:` corrección.
- `docs:` documentación.
- `refactor:` cambio interno sin cambio de comportamiento.
- `chore:` dependencias, configuración, etc.

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

Antes de abrir una PR deben pasar `typecheck`, `lint`, `test` y `build`. Los formatos de importación se cubren con tests en `src/imports`.

## Estructura

```
src/
  App.tsx              estado global, filtros y orquestación
  components/          UI presentacional y formularios
  storage.ts           localStorage, importación y exportación JSON
  types.ts             modelos y constantes compartidas
docs/                  documentación de decisiones y formatos
```

## Modelo de datos

Un juego tiene `id`, `título`, `plataforma` (`steam`, `epic`, `emulator`, `other`), `estado` (`playing`, `completed`, `backlog`, `dropped`), `horas`, `valoración` (0-5), `notas` y fechas `addedAt`/`updatedAt` en ISO.

La biblioteca se guarda en `localStorage` bajo la clave `gametracker.games.v1`. El archivo exportado es `{ "version": 1, "games": [...] }` y se puede volver a importar; los juegos con el mismo `id` se sobrescriben.

## Decisiones de diseño

- Primera fase 100% local: sin cuentas, servidor ni credenciales.
- Los importadores leen archivos que exporta el propio usuario, no llaman a APIs con claves privadas.
- La normalización de datos importados ocurre en un único punto para que cualquier origen produzca el mismo modelo.
