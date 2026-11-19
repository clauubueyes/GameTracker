# Modelo de datos

Toda la biblioteca usa un único tipo, `Game`, definido en `src/types.ts`. Cualquier origen (manual, Steam, Epic o ROMs) se convierte a este modelo antes de guardarse.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | `string` | Identificador estable. Manual: UUID. Steam: `steam-<appid>`. Epic: `epic-<CatalogItemId>` o `epic-<AppName>`. ROMs: `rom-<slug(carpeta + título)>`. |
| `title` | `string` | Título visible. Obligatorio; los juegos sin título se descartan. |
| `platform` | `steam \| epic \| emulator \| other` | Origen de la entrada en la app. |
| `status` | `playing \| completed \| backlog \| dropped` | Estado de seguimiento. |
| `hours` | `number` | Horas jugadas, nunca negativas. |
| `rating` | `number` | Entero de 0 a 5; `0` significa sin valorar. |
| `notes` | `string` | Texto libre del usuario. |
| `originalPlatform` | `string` | Plataforma o consola original. `PC` en Steam/Epic; consola inferida por extensión en ROMs; libre en entradas manuales. |
| `purchaseDate` | `string` | Fecha `YYYY-MM-DD` o cadena vacía. |
| `tags` | `string[]` | Etiquetas sin duplicados ni espacios sobrantes. |
| `addedAt` | `string` | ISO de creación. |
| `updatedAt` | `string` | ISO de última modificación. |

## Normalización

`normalizeGame` en `src/imports/normalize.ts` es el único punto que valida datos externos:

- Los valores de texto se recortan; los campos ausentes o con tipos incorrectos pasan a `''`.
- `platform` y `status` desconocidos pasan a `other` y `backlog`.
- `hours` negativos o no finitos pasan a `0`; `rating` se redondea y limita a 0-5.
- `purchaseDate` solo se acepta si es una fecha real en formato `YYYY-MM-DD`; si no, queda vacía.
- `tags` se filtra a strings no vacíos y se deduplica sin distinguir mayúsculas, conservando la primera forma escrita.
- Si falta `id`, se genera un UUID.

## Compatibilidad

Los archivos exportados antes de añadir estos campos siguen siendo válidos: al cargarlos o importarlos, `originalPlatform`, `purchaseDate` y `tags` reciben sus valores por defecto (`''`, `''` y `[]`). La versión del archivo exportado sigue siendo `1` porque el cambio es retrocompatible.
