# Sistema visual — OrosBlooms

Estado: Fase 1 implementada. La imagen de referencia aportada por el usuario guía la composición, sin copiar su marca, textos ni imágenes. Los valores podrán ajustarse con fotografía real y futuras pruebas de contraste.

Referencia visual recibida: [visual-reference.png](visual-reference.png).

## Marca

La identidad pública presenta primero diseño floral premium: naturaleza, cercanía y oficio con composición editorial y mucho espacio libre. Los productos personalizados aparecen como categoría secundaria. La frase guía es “Más que flores, emociones.” El administrador prioriza lectura, velocidad y claridad.

Las flores dominan fotografía, jerarquía y espacio visual. Osos, peluches, chocolates, globos, tarjetas y detalles personalizados aparecen como complementos del momento floral, bajo el mensaje “Elige tus flores y haz el momento aún más especial.” Evitar una portada que parezca tienda genérica de regalos.

## Tokens iniciales

| Token | Propuesta | Uso |
| --- | --- | --- |
| `--background` | `#FAF8F4` | Fondo cálido principal |
| `--foreground` | `#292B25` | Texto principal |
| `--cream` | `#F1EBE1` | Superficies alternas |
| `--blush` | `#D8B8B5` | Toque floral moderado |
| `--sage` | `#A8B5A1` | Superficies naturales |
| `--olive` | `#59654D` | Acciones principales |
| `--burgundy` | `#744448` | Acento ocasional |
| `--muted` | `#6E7168` | Texto secundario |
| `--border` | `#DFDDD5` | Separadores suaves |

Los tokens semánticos (`background`, `foreground`, `surface`, `olive`, `muted`, `border`, `focus`, `success`, `danger`) usan esta paleta. Los estados de error y éxito deberán comprobar contraste en sus componentes futuros. Evitar degradados genéricos, sombras fuertes y rosa saturado.

Los tokens CSS implementados están en `app/globals.css`, incluidos superficie, acentos suaves, estados y foco. Tailwind los expone como colores semánticos. La vista de desarrollo muestra cada color en contexto.

## Tipografía y composición

- Georgia como serif editorial y Arial como sans de sistema, sin descarga de fuentes en esta fase. Serif para titulares, campañas, bodas y storytelling; sans para texto corrido, navegación, botones, formularios y administrador.
- Escala implementada: `display-xl`, `display-lg`, `h1`, `h2`, `h3`, `body-lg`, `body`, `small`, `caption`. Los titulares usan `clamp()` y tamaños fluidos; las clases `type-*` viven en `app/globals.css`.
- Espaciado basado en incrementos de 4 px. `Container` limita el ancho a 1440 px; `Section` usa 56/80/112 px de espacio vertical para móvil/tablet/desktop.
- Radios de tarjetas de 16–24 px cuando ayuden a la composición; botones redondeados. Bordes discretos, foco visible y objetivos táctiles de al menos 44 px.

## Fotografía

Fotografías grandes, recortes deliberados y proporciones estables. `next/image`, `sizes` adecuados y dimensiones conocidas para evitar desplazamiento de layout. Overlays solo donde el texto lo necesite. `alt` describe el contenido significativo; las imágenes decorativas usan texto alternativo vacío. Skeletons conservan la proporción mientras carga la imagen. `public/bouquet-editorial.png` es una fotografía de muestra generada para la vista interna; no representa un producto real del negocio.

## Componentes previstos para Fase 1

Se implementaron `Button`, `IconButton`, `Container`, `Section`, `SectionHeader`, `Badge`, `Chip`, `Card`, `ProductCard`, `CategoryCard`, `GalleryCard`, `ImageCard`, `EmptyState`, `LoadingState`, `TextField` y `TextAreaField` en `components/shared/`. Son Server Components por defecto, con HTML semántico y variantes limitadas. Las tablas, diálogos y formularios complejos del administrador se introducirán con su flujo correspondiente.

En el futuro, el detalle floral tendrá selección de tamaño/color y una sección secundaria “Complementa tu arreglo”. Sus tarjetas mostrarán imagen, nombre, incremento de precio y acción táctil clara. El resumen hará visible el total sin saturar la fotografía principal. Los combos tendrán tratamiento editorial floral, no una cuadrícula de regalos indiferenciada.

## Responsive y movimiento

- Desktop: retícula editorial amplia e imagen protagonista.
- Tablet: menos columnas y espacios moderados.
- Móvil: navegación e interacciones pensadas para una mano; no depender de hover. La Home de Fase 3 usa hero propio, búsqueda visible, categorías circulares desplazables, menú táctil y navegación inferior hacia secciones disponibles.
- Referencia recibida: en desktop, encabezado horizontal limpio, hero con fotografía floral dominante, categorías visuales y catálogo con filtros laterales; en móvil, búsqueda accesible, chips desplazables, tarjetas de dos columnas y navegación inferior. OrosBlooms conservará su identidad, nombre y paleta propia.
- La adaptación se diseñará por ancho real de contenido: 320, 375, 390, 430, 768, 1024, 1280, 1440 y 1920 px. En móvil se revisarán truncamiento, tarjetas, filtros, navegación fija, áreas táctiles y ausencia de desbordamiento horizontal. Sidebar y controles densos se transformarán en patrones táctiles, no se comprimirán.
- Para complementos en móvil, usar una franja de tarjetas horizontales “Hazlo más especial” con imagen, nombre, precio adicional y botón de agregar. Mantener el arreglo y su CTA visibles; filtros del catálogo mediante drawer o bottom sheet. Desktop puede presentar recomendaciones y resumen en columnas, con más aire.
- Transiciones sutiles; toda animación funcional respeta `prefers-reduced-motion`. Nunca ocultar información crítica detrás de movimiento.

`/design-system` está disponible solo en desarrollo para verificar tipografía, color, botones, tarjetas, chips, formularios, grids e imágenes. En producción responde como página no encontrada. Se revisó visualmente a 320 px, 390 px y ancho desktop; a 320 px las tarjetas de producto pasan a una columna y desde 360 px muestran dos.

La Home usa imágenes de muestra en `public/home-*.webp`, generadas para este proyecto. Las nuevas fotografías finales deberán sustituirse por material del negocio. Los iconos sin flujo disponible (favoritos, perfil, carrito) se presentan sin acción; la búsqueda y la navegación inferior llevan a secciones existentes hasta que lleguen las fases de catálogo y cuenta.
