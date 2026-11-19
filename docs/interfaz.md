# Interfaz

La pantalla principal se divide en cuatro áreas.

## Resumen

Las tarjetas superiores muestran número de juegos, horas totales, completados y juegos en curso. Calculan sobre toda la biblioteca, no sobre los resultados filtrados.

## Gráficas

Dos barras horizontales muestran la distribución de la biblioteca:

- **Por plataforma**: Steam, Epic Games, emuladores y otros.
- **Por estado**: jugando, completado, pendiente y abandonado.

Cada barra indica el recuento absoluto y su proporción respecto al total. Se actualizan al añadir, editar, borrar o importar juegos.

## Filtros y búsqueda

La barra de herramientas permite:

- Buscar por título, notas, etiquetas o plataforma original (sin distinguir mayúsculas).
- Filtrar por plataforma, estado, etiqueta y año de compra.
- Ordenar por fecha de actualización, título u horas.
- Limpiar todos los filtros de una vez con **Limpiar filtros**, que aparece cuando hay alguno activo.

Las listas de etiquetas y años se generan a partir de la biblioteca actual. La lógica está en `src/filters.ts`, separada de la UI y cubierta por tests.

## Acciones

- **Importar archivos**: copias de GameTracker, respuestas de Steam y manifiestos `.item` de Epic; admite selección múltiple.
- **Importar ROMs**: selecciona una carpeta y crea entradas para los archivos con extensiones de ROM reconocidas.
- **Exportar**: descarga la biblioteca completa como JSON.
- **+ Nuevo juego**: abre el formulario de alta o edición.

## Detalle de un juego

Cada tarjeta muestra título, plataforma, estado, horas, valoración, notas y, cuando existen, plataforma original, fecha de compra y etiquetas.
