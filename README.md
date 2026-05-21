# Softlab — Biblioteca Digital de Manuales de Usuario

Plataforma web institucional del **Semillero de Investigación Softlab** de la Corporación Universitaria Autónoma del Cauca. Centraliza y publica los manuales de capacitación técnica producidos por el semillero, con soporte para visualización de PDF, galería de evidencias y panel de administración.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| UI | React 19 + Vite 8 |
| Estilos | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| Animaciones | Framer Motion |
| Formularios | React Hook Form |
| Visor PDF | react-pdf + pdfjs-dist |
| Modo libro | react-pageflip |
| Galería | LightGallery |
| Iconos | lucide-react |
| Persistencia | localStorage + IndexedDB |

---

## Características

### Biblioteca pública
- Catálogo de manuales con búsqueda en tiempo real y filtro por categoría
- Página de detalle por manual: introducción, tabla de contenidos, objetivos, autores, ponente e institución
- Visor PDF integrado con dos modos: **Normal** (navegación página a página con zoom) y **Modo libro** (animación de paso de página estilo libro físico)
- Galería de evidencias con lightbox, zoom y miniaturas

### Panel de administración
Ruta: `/panel-softlab-admin` — acceso con clave `softlab2024`

- Gestión completa de manuales: crear, editar, destacar y eliminar
- Gestión de participantes: foto de perfil, rol, carrera, habilidades y redes sociales
- Subida de PDF directamente al navegador (IndexedDB) o mediante URL externa
- Dashboard con estadísticas y accesos rápidos

### Sección "Nosotros"
- Perfil de cada investigador con modal expandible
- Directores del semillero con info y enlaces
- Valores e identidad del semillero

---

## Arquitectura

El proyecto sigue **Feature-Sliced Design (FSD)**:

```
src/
├── app/
│   ├── router.jsx              # Definición de rutas
│   └── layouts/
│       └── MainLayout.jsx      # Layout público (Navbar + Footer)
│
├── pages/
│   ├── HomePage/               # Landing page
│   ├── ManualsPage/            # Catálogo de manuales
│   ├── ManualDetailPage/       # Detalle + visor PDF
│   ├── AboutPage/              # Sobre el semillero
│   └── AdminPage/              # Panel admin (AdminLayout + páginas)
│
├── widgets/
│   ├── Navbar/                 # Navbar sticky responsive
│   ├── Footer/
│   ├── HeroSection/
│   ├── FeaturedSection/
│   ├── AboutSection/
│   ├── ParticipantsSection/
│   ├── ManualCard/             # Card normal y card destacada
│   ├── ManualGrid/             # Grid con búsqueda y filtros
│   └── AdminSidebar/           # Sidebar responsive con overlay móvil
│
├── features/
│   ├── admin-auth/             # Login del panel admin
│   ├── gallery/                # Galería con LightGallery
│   ├── manual-form/            # Formulario crear/editar manual
│   ├── manual-viewer/          # PDFViewer + BookViewer
│   └── participant-form/       # Formulario de participante
│
├── entities/
│   ├── manual/model.js
│   └── participant/model.js
│
├── shared/
│   ├── ui/                     # Button, Badge, Input, Modal, Spinner, Avatar, SectionTitle
│   ├── lib/                    # cn(), formatDate()
│   ├── hooks/                  # useLocalStorage, useDisclosure, useResolvedImage
│   └── constants/              # NAV_LINKS, CATEGORIES, SOFTLAB_INFO
│
├── data/                       # Valores iniciales (manuals.js, participants.js, speakers.js, directors.js)
└── storage/
    ├── localStorageRepository.js   # Repositorios (manuals, participants, speakers, adminAuth)
    ├── pdfStorageService.js        # Almacén de PDFs en IndexedDB
    └── imageStorageService.js      # Almacén de imágenes en IndexedDB
```

---

## Instalación y desarrollo

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd softlab-manuales

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Previsualizar el build
npm run preview
```

Requiere **Node.js 18+**.

---

## Persistencia de datos

Todo el contenido se almacena **localmente en el navegador**, sin backend.

| Datos | Almacén | Clave |
|---|---|---|
| Manuales | `localStorage` | `softlab_manuals` |
| Participantes | `localStorage` | `softlab_participants` |
| Ponentes | `localStorage` | `softlab_speakers` |
| Sesión admin | `localStorage` | `softlab_admin_auth` |
| Archivos PDF | `IndexedDB` | `idb:<id>` |
| Fotos de perfil | `IndexedDB` | `img:<id>` |

Los datos de `localStorage` se inicializan desde los archivos en `src/data/` si no existe ningún valor guardado. Al limpiar el almacenamiento del navegador los datos vuelven a los valores por defecto.

### PDFs en IndexedDB

Al subir un PDF desde el panel admin se almacena en IndexedDB y se guarda la clave `idb:<id>` en el campo `pdf` del manual. Antes de abrir el visor, `resolvePDFUrl()` convierte esa clave en un `ObjectURL` temporal que se libera al cerrar el modal.

---

## Visor de PDF

El visor (`PDFViewer`) expone dos modos seleccionables:

- **Normal** — visualización página a página con navegación, zoom (50 %–250 %) y descarga.
- **Modo libro** — animación de paso de página con portada generada automáticamente y contratapa. El ancho de página se calcula mediante `ResizeObserver` sobre el contenedor para ser completamente responsive.

El worker de PDF.js se carga desde CDN con la misma versión que `react-pdf` para evitar incompatibilidades:

```js
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

---

## Accesibilidad

La aplicación cumple los criterios **WCAG 2.1 AA**:

- Skip link "Ir al contenido principal" en la Navbar
- `role="dialog"` + `aria-modal` + focus trap en todos los modales
- `aria-label` en todos los botones icon-only
- `aria-expanded` + `aria-controls` en los toggles de menú
- `aria-live="polite"` en contadores de páginas del visor
- Navegación por teclado completa (Tab / Shift+Tab / Escape)
- Focus ring visible en todos los controles interactivos
- Contraste de color WCAG AA en texto y controles

---

## Alias de rutas

El alias `@` apunta a `./src`, configurado en `vite.config.js`:

```js
resolve: {
  alias: { '@': path.resolve(__dirname, './src') }
}
```

---

## Notas de desarrollo

- **Tailwind v4**: `@import "tailwindcss"` debe ir **después** de `@import url(...)` en el CSS. Los tokens personalizados se declaran en `@theme {}`.
- **lucide-react v1.16+**: Los iconos de marca (`Github`, `Linkedin`) no existen en esta versión. Usar `GitBranch` y `ExternalLink` como sustitutos.
- **react-pageflip**: Requiere `forwardRef` en cada página hija del `HTMLFlipBook`.
- **IndexedDB + ObjectURL**: Llamar siempre a `URL.revokeObjectURL()` al cerrar el visor para evitar fugas de memoria.

---

## Estructura del equipo (datos de ejemplo incluidos)

| Manual | Autores |
|---|---|
| Fundamentos y Aplicaciones de la Realidad Virtual | Héctor Garcés, Carlos Caicedo |
| Manual de Capacitación Docker (2026-04-22) | Juan Burbano, Julian Clavijo — Ponente: Jesús Melo Muñoz |

---

## Licencia

Proyecto académico del Semillero de Investigación Softlab.  
Corporación Universitaria Autónoma del Cauca — Facultad de Ingeniería de Software y Computación.
"# MANUAL-CAPACITACIONES-SOFTLAB" 
