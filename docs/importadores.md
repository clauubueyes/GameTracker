# Importadores

Los importadores transforman un archivo elegido por el usuario en juegos del modelo de `src/types.ts`. Ninguno necesita credenciales ni conexión a internet.

## Flujo común

1. El usuario selecciona un archivo desde **Importar**.
2. El parser correspondiente valida el contenido y devuelve una lista de juegos.
3. `mergeGames` de `src/App.tsx` añade los juegos por `id`, sobrescribiendo los duplicados.

Cuando un importador falle, se muestra el error en la interfaz y la biblioteca actual queda intacta.

## Orígenes soportados

| Origen | Rama | Estado |
| --- | --- | --- |
| Copia JSON de GameTracker | base | Disponible |
| Steam (`GetOwnedGames`) | `feat/import-steam` | En desarrollo |
| Epic Games (`library.json`) | Pendiente | No implementado |
| Emuladores / carpetas de ROMs | Pendiente | No implementado |
