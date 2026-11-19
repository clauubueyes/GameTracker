# Importadores

Los importadores transforman uno o varios archivos elegidos por el usuario en juegos del modelo de `src/types.ts`. Ninguno necesita credenciales ni conexión a internet desde la aplicación.

## Flujo común

1. El usuario selecciona uno o varios archivos desde **Importar archivos**, o una carpeta desde **Importar ROMs**.
2. `parseImportedFiles` llama a `parseImportedFile` para cada archivo; `parseRomFiles` procesa las carpetas de ROMs.
3. `mergeGames` de `src/App.tsx` añade los juegos por `id`, sobrescribiendo los duplicados.
4. Si hay un error, se muestra en la interfaz y la biblioteca actual queda intacta.

Los formatos se detectan por la forma del JSON, no por el nombre del archivo. Cuando se importan varios archivos, el último que defina un `id` gana.

## Campos comunes

Todos los importadores dejan `purchaseDate` y `tags` vacíos para que los complete el usuario. `originalPlatform` es `PC` en Steam y Epic, y se infiere de la extensión del archivo en ROMs. El resto de campos se detalla en [modelo-datos.md](modelo-datos.md).

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

## Epic Games

Rama: `feat/import-epic`.

### Cómo obtener los archivos

Epic guarda un manifiesto JSON por juego instalado. En Windows están en `%PROGRAMDATA%\Epic\EpicGamesLauncher\Data\Manifests` con extensión `.item` (`C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests`); la carpeta `ProgramData` está oculta por defecto.

Selecciona todos los `.item` que quieras importar a la vez desde **Importar archivos**. También funciona un único `.item` o un array JSON de manifiestos.

### Formato esperado

```json
{
  "AppName": "Turaco",
  "DisplayName": "Nuclear Throne",
  "CatalogNamespace": "742f165671424189aecdfdadf5ea9755",
  "CatalogItemId": "3524134c7a4e4cf2832d8d2a634baef8",
  "InstallLocation": "D:\\Epic Games\\NuclearThrone",
  "bIsApplication": true,
  "bIsExecutable": true,
  "bIsIncompleteInstall": false
}
```

### Conversión

| Campo de GameTracker | Origen |
| --- | --- |
| `id` | `epic-<CatalogItemId>` o `epic-<AppName>` si no hay `CatalogItemId` |
| `title` | `DisplayName`, con `AppName` como respaldo |
| `platform` | Siempre `epic` |
| `status` / `hours` | `backlog` / `0`: los manifiestos no incluyen tiempo de juego |
| `rating` / `notes` | `0` / vacío |

Se omiten los manifiestos con `bIsIncompleteInstall: true`, `bIsApplication: false` o `bIsExecutable: false` para no importar instalaciones rotas, herramientas ni componentes de DLC. La ruta de instalación no se guarda.

### Errores frecuentes

- `El archivo no contiene una lista de juegos.`: un `.item` sin `AppName` ni `CatalogItemId` no se reconoce como manifiesto de Epic.
- `No se encontraron juegos válidos en los archivos de Epic.`: todos los manifiestos se omitieron por las reglas anteriores.

## Emuladores / carpetas de ROMs

Rama: `feat/import-roms`.

### Cómo importar

Pulsa **Importar ROMs** y elige la carpeta raíz de tu biblioteca. Requiere un navegador con soporte para selección de carpetas (`webkitdirectory`), como Chrome, Edge o Firefox. Los archivos se leen en el navegador; no se suben a ningún servidor.

### Reglas

- Se ignoran los archivos cuyas extensiones no son de ROM (por ejemplo `.txt`, `.png` o `.nfo`). Se reconocen extensiones habituales como `.zip`, `.7z`, `.rom`, `.nes`, `.snes`, `.gba`, `.nds`, `.n64`, `.iso`, `.chd`, `.cue`, `.bin`, `.3ds`, `.psx` y similares; la lista completa está en `src/imports/roms.ts`.
- El título es el nombre del archivo sin extensión, sin grupos `(...)`, `[...]` y con `_` convertidos en espacios.
- El `id` es `rom-<slug(carpeta + título)>`, por lo que volver a importar la misma carpeta no crea duplicados.
- `plataforma` es siempre `emulator`, `estado` es `backlog` y `horas`/`valoración` son `0`.
- `notas` guarda la ruta relativa del archivo como `ROM: <ruta>` para saber de dónde viene el juego.
- `Juego.bin` y `Juego.cue` en la misma carpeta se colapsan en una sola entrada.

### Errores frecuentes

- `No se encontraron ROMs con extensiones reconocidas.`: la carpeta seleccionada no contiene archivos con extensiones de ROM.
