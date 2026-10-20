# peluqueria-frontend

Angular 21 · landing pública (`/`), acceso del dueño (`/gestion`) y panel privado (`/admin`).

## Ver cómo queda (modo demo, sin backend)
```bash
npm install
npm start          # = ng serve  →  http://localhost:4200
```
- Sitio público: `http://localhost:4200/`
- Panel: `http://localhost:4200/gestion` (las credenciales de prueba ya vienen cargadas: `admin@demo.com` / `demo1234`)

En modo demo los datos son de ejemplo, viven en la memoria del navegador (se reinician al recargar) y las fotos son ilustraciones de relleno.
Todo es editable: prueba crear servicios, apagar una promoción, subir fotos (se ven al instante) o apagar los testimonios.

> Si `npm install` falla con un error interno de npm (`edgesOut`), usa `npm install --legacy-peer-deps`.

## Conectar con tu backend real
Edita `src/app/core/config.ts`:
```ts
export const API_URL = 'http://localhost:4000/api';
export const DEMO_MODE = false;   // ← desactiva la API simulada
```

## Dónde están los estilos (para llevarlos a tu proyecto)
| Archivo | Contiene |
|---|---|
| `src/index.html` | Carga de fuentes Montserrat + Playfair Display |
| `src/styles.scss` | Variables de color/tipografía (`:root`), animación `.reveal` de la galería y las clases del panel: `.page-head`, `.panel`, `.btn`, `.btn-solid`, `.btn-line`, `.icon-btn`, `.data-table`, `.badge`, `.field`, `.modal-backdrop`, `.modal-card`, `.file-chip` (`.demo-hint` solo es del modo demo) |
| `src/app/features/landing/landing.scss` | Barra superior, portada, tarjetas de servicio, galería, promoción, testimonios, ubicación y pie |
| `.../landing/components/service-modal/service-modal.scss` | Ventana flotante del servicio |
| `.../landing/components/lightbox/lightbox.scss` | Visor de fotos a pantalla completa |
| `src/app/shared/` (`icon.ts`, `toggle.ts`, `toast.ts`, `reveal.directive.ts`) | Íconos SVG, interruptor, avisos y animación de aparición (estilos dentro de cada archivo) |
| `src/app/features/admin/*-admin/*.scss` | Detalles propios de cada pantalla del panel |

Para llevarlos a tu proyecto: copia esos archivos conservando los nombres de clase, más `src/app/core/models.ts` y `core/utils.ts`, que los componentes importan.
`sidebar`, `layout`, `dashboard-home` y `login` conservan tus `.scss` originales.

## Producción
`angular.json` ya trae el límite de tamaño de estilos por componente subido a 16 kB (`landing.scss` pesa ~10 kB y el valor por defecto de Angular, 8 kB, hacía fallar `ng build`).
Los archivos `*.spec.ts` no se incluyen en este proyecto.
