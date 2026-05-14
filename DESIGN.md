# EduStay Frontend - Design Reference
> Plataforma de alojamiento estudiantil confiable, clara y cercana.

**Theme:** light

EduStay debe sentirse como un producto universitario moderno: confiable para estudiantes y arrendadores, practico para buscar, y suficientemente calido para hablar de hogar. La direccion visual combina una base clara, fotografia real de habitaciones, azul institucional para acciones principales y verdes suaves para estados de confianza o verificacion.

Esta guia toma como referencia el enfoque de Refero Styles: documentar gusto visual en tokens, reglas de uso y componentes reutilizables para que el frontend crezca con consistencia.

## Principios

- **Confianza antes que decoracion:** cada pantalla debe ayudar a decidir rapido si un alojamiento es seguro, cercano y conveniente.
- **Claridad academica:** priorizar jerarquia limpia, texto directo, filtros visibles y datos comparables.
- **Calidez residencial:** usar imagenes reales, luz natural y microcopy humano; evitar que la app parezca banca, inmobiliaria corporativa o dashboard frio.
- **Accion evidente:** buscar, iniciar sesion, registrarse y publicar alojamiento deben ser faciles de encontrar.
- **Responsive por defecto:** mobile no es una version secundaria; formularios, cards y filtros deben sentirse completos en pantallas pequenas.

## Tokens - Colors

| Name | Value | Token | Role |
| --- | --- | --- | --- |
| Edu Blue 800 | `#1e3a8a` | `--brand-800` | Hover, estados activos, enfasis institucional fuerte |
| Edu Blue 700 | `#1d4ed8` | `--brand-700` | CTA principal, links importantes, foco de marca |
| Ink 900 | `#111827` | `--slate-900` | Titulares y texto de maxima prioridad |
| Slate 700 | `#334155` | `--slate-700` | Labels, texto de UI, botones secundarios |
| Slate 600 | `#475569` | `--slate-600` | Body copy, navegacion, descripcion |
| Slate 500 | `#6b7280` | `--slate-500` | Metadata, placeholders, texto auxiliar |
| Canvas | `#f5f5f5` | `--surface` | Fondo general de la aplicacion |
| White | `#ffffff` | `--surface-card` | Cards, formularios, paneles elevados |
| Trust Green | `#a7f3d0` | `--trust-200` | Badges de verificacion, indicadores positivos |
| Trust Green Text | `#065f46` | `--trust-800` | Texto sobre badges verdes |
| Error Red | `#ef4444` | `--danger-500` | Errores de formulario y validacion |
| Focus Blue | `#93c5fd` | `--focus-ring` | Outline accesible en foco |

## Surfaces

| Level | Name | Value | Purpose |
| --- | --- | --- | --- |
| 0 | App Canvas | `#f5f5f5` con gradientes radiales azules muy suaves | Fondo global, nunca debe competir con el contenido |
| 1 | Card Surface | `#ffffff` | Formularios, tarjetas de registro, panels de filtros |
| 2 | Frosted Nav | `rgba(249, 250, 251, 0.82)` + blur | Barra superior sticky |
| 3 | Photo Overlay | Gradiente azul/negro sobre imagen | Hero y cards fotograficas con texto legible |

Evitar fondos saturados de color en secciones completas. Si una pantalla necesita separacion, usar blanco, canvas o una banda gris muy clara.

## Typography

Fuente principal: **Plus Jakarta Sans**, fallback `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

| Use | Size | Weight | Line height | Notes |
| --- | --- | --- | --- | --- |
| Display / Hero | `clamp(2rem, 4.9vw, 4.1rem)` | 800 | `0.98-1.05` | Solo para hero o pantalla principal |
| Page title | `2rem-2.5rem` | 800 | `1.1` | Registro, login, listados |
| Section title | `1.6rem-2rem` | 800 | `1.15` | Encabezados de bloques |
| Card title | `1.05rem-1.4rem` | 700 | `1.2` | Propiedades, opciones de registro |
| Body | `0.95rem-1rem` | 400-500 | `1.45-1.6` | Texto descriptivo |
| UI label | `0.8rem-0.9rem` | 600-700 | `1.2` | Labels, chips, botones, metadata |

No usar letter-spacing negativo fuera de titulares grandes. Mantener textos de botones cortos y accionables.

## Spacing & Shape

| Element | Value |
| --- | --- |
| Max content width | `1200px` para landing/listados, `420-600px` para formularios |
| Page padding | `1rem-1.2rem` mobile, `2rem-3rem` desktop |
| Section gap | `2.4rem-4rem` |
| Card padding | `1rem` compacta, `2rem-2.5rem` formularios |
| Element gap | `0.5rem-1.25rem` |
| Buttons radius | `10px-12px` |
| Cards radius | `14px-18px`; formularios pueden llegar a `24px` |
| Image radius | `10px-16px` |

No crear cards dentro de cards. Si hace falta agrupar informacion, usar divisores, grid o subpaneles planos.

## Elevation

- **Navbar:** sin sombra pesada; usar blur, fondo translucido y borde inferior `rgba(15, 23, 42, 0.08)`.
- **Formulario / auth card:** `0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)`.
- **Photo card:** `0 14px 30px rgba(15, 23, 42, 0.18)`.
- **Hero:** sombra amplia solo cuando la imagen esta contenida: `0 20px 50px rgba(15, 23, 42, 0.24)`.

Las sombras deben levantar suavemente, no dramatizar. Evitar sombras negras duras o multiples capas excesivas.

## Imagery

Usar fotografia real de habitaciones, estudios, escritorios, residencias y espacios universitarios. Preferir:

- Luz natural, espacios limpios, camas/escritorios visibles.
- Composicion amplia para hero y recortes claros para cards.
- Personas solo si aportan contexto estudiantil, no como stock generico.
- Overlays oscuros o azules cuando haya texto encima.

Evitar imagenes demasiado lujosas, hoteles, oficinas corporativas o habitaciones oscuras que no parezcan alojamiento estudiantil.

## Components

### Navbar

- Sticky superior, altura aproximada `72px`.
- Logo textual `Edu` en ink y `Stay` en azul.
- Links centrados en desktop; en mobile apilar de forma limpia.
- Acciones a la derecha: ghost para "Iniciar sesion", primario para "Publicar alojamiento".

### Buttons

- Primario: fondo `--brand-700`, texto blanco, hover `--brand-800`.
- Secundario/ghost: texto azul, fondo transparente o gris claro.
- Alto minimo: `44-46px`.
- Disabled: opacidad `0.6`, sin hover transform.
- Evitar mas de un CTA primario por bloque visual.

### Forms

- Labels siempre visibles, no depender solo de placeholders.
- Inputs con radio `12px`, borde slate al 30%, foco con ring azul suave.
- Validacion inline debajo del campo con rojo `--danger-500`.
- En desktop se permiten filas de 2 columnas; en mobile siempre una columna.
- Boton de mostrar/ocultar contrasena debe ser discreto y no tapar el input.

### Search Panel

- Debe sentirse como el control principal de la home.
- Fondo claro, radio `14px`, input blanco y botones alineados.
- En mobile: input, filtros y buscar apilados.
- Chips debajo para filtros aplicados o sugerencias, con estilo pill.

### Listing / Property Cards

- Foto como protagonista, texto sobre overlay legible o contenido en superficie blanca.
- Mostrar como minimo: nombre, precio, distancia/universidad cercana y estado de verificacion.
- Badges verdes solo para confianza/verificacion; no usarlos para informacion neutra.
- Mantener alturas estables para que el grid no salte.

### Auth & Registration

- Login y registro deben tener cards centradas, max-width definido y copy breve.
- Titulares en tono acogedor, no excesivamente emocional.
- Diferenciar estudiante y arrendador con contenido y CTA, no con paletas totalmente distintas.

## Voice & Copy

Idioma principal: espanol claro, con UTF-8 correcto.

Preferir:

- "Busca cerca de tu universidad, ciudad o barrio"
- "Alojamiento verificado"
- "Publicar alojamiento"
- "Registro estudiante"
- "Registro arrendador"
- "Iniciar sesion"

Evitar:

- Mojibake como secuencias corruptas de acentos, signos invertidos o bullets.
- Promesas vagas como "el mejor lugar del mundo".
- Tono demasiado inmobiliario premium si el usuario principal es estudiante.

## Accessibility

- Mantener `:focus-visible` en links, botones e inputs.
- Contraste AA minimo para texto normal.
- No colocar texto sobre imagen sin overlay suficiente.
- Inputs con `label` real y mensajes de error asociados visualmente.
- Botones icon-only deben tener `aria-label`.
- No usar color como unica senal de error o exito.

## Responsive Rules

- Breakpoints actuales: alrededor de `900px`, `880px` y `480px`; mantenerlos coherentes o centralizarlos si se refactoriza.
- Hero: reducir radio y apilar search panel bajo `900px`.
- Navbar: permitir wrap/apilado sin ocultar acciones clave.
- Formularios: dos columnas solo si cada campo conserva minimo `180px`.
- Cards: pasar a una columna en mobile y preservar imagen visible.

## Do

- Reutilizar tokens de `src/styles.scss` antes de introducir colores nuevos.
- Usar fotos reales para home y alojamientos.
- Mantener una jerarquia clara: titulo, descripcion, accion, metadata.
- Disenar estados hover, focus, disabled y error en cada componente interactivo.
- Mantener la app ligera: Angular + SCSS local, sin librerias visuales innecesarias.
- Revisar cada nuevo texto con codificacion UTF-8.

## Don't

- No crear paletas nuevas por pantalla.
- No usar gradientes decorativos fuertes ni orbes como fondo.
- No abusar de cards flotantes; reservarlas para elementos repetidos o formularios.
- No usar verdes para CTAs principales; verde significa confianza/verificacion.
- No esconder labels de formulario.
- No introducir imagenes de hoteles, coworkings o interiores de lujo que desplacen el contexto estudiantil.
- No usar radios enormes en cards de contenido operativo; mantenerlas entre `14px` y `18px`.

## Implementation Notes

- Archivo base de tokens: `src/styles.scss`.
- Componentes globales actuales: `navbar`, `footer`, `home`, `login`, `registro`.
- Si se agregan componentes compartidos, crear clases o mixins SCSS para botones, inputs, cards y badges antes de duplicar estilos.
- Corregir progresivamente los textos con mojibake en HTML existentes para que el producto se vea cuidado.
