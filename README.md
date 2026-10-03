# Innova Carty · Landing Page

Sitio estático de Innova Carty (HTML5, CSS3 y JavaScript sin frameworks), basado en los mock-ups del capítulo 5 del informe y en la guía de estilo 5.1.1 (Material Design 3).

## Estructura

| Ruta | Contenido |
| :--- | :--- |
| `index.html` | Página principal: hero, métricas, cómo funciona, beneficios por segmento, producto, app, formulario de demo + FAQ, equipo. |
| `terms.html`, `privacy.html` | Páginas legales (SEO 5.2.3-C). |
| `assets/css/styles.css` | Tokens de diseño y estilos responsive (desktop 1440 px, tablet, mobile 390 px). |
| `assets/js/config.js` | URL de la Web App y del video del producto. |
| `assets/js/i18n.js` | Textos en inglés; el español está en el HTML. |
| `assets/js/main.js` | Cambio de idioma, menú móvil, pestañas de beneficios, validación del formulario. |
| `assets/fonts/` | Inter, Roboto y Material Symbols incluidas en el repo. |

## Ejecutar en local

```bash
npx serve .
```

## Despliegue

Vercel, como sitio estático sin build (Framework preset: Other, Output directory: `.`).
