# Importadores

Los importadores transforman un archivo elegido por el usuario en juegos del modelo de `src/types.ts`. Ninguno necesita credenciales ni conexión a internet desde la aplicación.

## Flujo común

1. El usuario selecciona un archivo desde **Importar**.
2. `parseImportedFile` detecta el formato y valida el contenido.
3. `mergeGames` de `src/App.tsx` añade los juegos por `id`, sobrescribiendo los duplicados.
4. Si hay un error, se muestra en la interfaz y la biblioteca actual queda intacta.

Los formatos se detectan por la forma del JSON, no por el nombre del archivo.

## Copia de GameTracker

Es el archivo generado por **Exportar**:

```json
{
  "version": 1,
  "games": [{ "id": "...", "title": "...", "platform": "steam" }]
}
```

También se acepta un array directo de juegos. Los campos desconocidos o con tipos inválidos se normalizan a valores por defecto; los juegos sin título se descartan.

## Steam

Rama: `feat/import-steam`.

### Cómo obtener el archivo

1. Genera una clave de la Web API de Steam y consigue tu `steamid`.
2. Llama al método `ISteamUser/GetOwnedGames` con `format=json` e `include_appinfo=1`.
3. Guarda la respuesta tal cual en un archivo `.json` e impórtalo desde la app.

También se acepta un array directo de juegos con `appid`, `name` y `playtime_forever`.

### Formato esperado

```json
{
  "response": {
    "game_count": 2,
    "games": [
      {
        "appid": 367520,
        "name": "Hollow Knight",
        "playtime_forever": 3120,
        "playtime_2weeks": 0
      }
    ]
  }
}
```

### Conversión

| Campo de GameTracker | Origen |
| --- | --- |
| `id` | `steam-<appid>` |
| `title` | `name` |
| `platform` | Siempre `steam` |
| `hours` | `playtime_forever / 60`, redondeado a 0,1 h |
| `status` | `playing` si `playtime_2weeks > 0`; si no, `backlog` |
| `rating` / `notes` | `0` / vacío para que los complete el usuario |

Los juegos repetidos por `appid` se colapsan en uno. Importar el mismo archivo dos veces no crea duplicados, pero sobrescribe las ediciones locales de esos juegos.

### Errores frecuentes

- `El archivo no contiene JSON válido.`: el archivo está corrupto o no es JSON.
- `No se reconoció el formato de Steam...`: falta `response.games` o el array no tiene `appid` y `name`.
- `No se encontraron juegos válidos...`: las entradas no tenían título o identificador.

## Orígenes pendientes

| Origen | Estado |
| --- | --- |
| Epic Games (`library.json`) | No implementado |
| Emuladores / carpetas de ROMs | No implementado |
