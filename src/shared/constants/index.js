// ─── Paleta de categorías — fuente única de verdad ────────────────────────────
export const CATEGORY_PALETTE = {
  'Realidad Virtual':        { accent: '#638CFF', glow: 'rgba(99,140,255,0.35)',  light: '#BFDBFE' },
  'DevOps':                  { accent: '#4F7BE8', glow: 'rgba(79,123,232,0.35)',  light: '#C7D7F8' },
  'Control de Versiones':    { accent: '#60A5FA', glow: 'rgba(96,165,250,0.35)',  light: '#DBEAFE' },
  'Desarrollo Frontend':     { accent: '#3B82F6', glow: 'rgba(59,130,246,0.35)',  light: '#BFDBFE' },
  'Desarrollo Backend':      { accent: '#93C5FD', glow: 'rgba(147,197,253,0.35)', light: '#EFF6FF' },
  'Bases de Datos':          { accent: '#2563EB', glow: 'rgba(37,99,235,0.35)',   light: '#BFDBFE' },
  'Gestión de Proyectos':    { accent: '#4F7BE8', glow: 'rgba(79,123,232,0.35)',  light: '#C7D7F8' },
  'Seguridad':               { accent: '#8BADF4', glow: 'rgba(139,173,244,0.35)', light: '#DBEAFE' },
  'Inteligencia Artificial': { accent: '#60A5FA', glow: 'rgba(96,165,250,0.35)',  light: '#DBEAFE' },
  'Redes':                   { accent: '#4F7BE8', glow: 'rgba(79,123,232,0.35)',  light: '#C7D7F8' },
  'Sistemas Operativos':     { accent: '#3B82F6', glow: 'rgba(59,130,246,0.35)',  light: '#BFDBFE' },
  default:                   { accent: '#93C5FD', glow: 'rgba(147,197,253,0.35)', light: '#BFDBFE' },
};

export const getCategoryPalette = (cat) =>
  CATEGORY_PALETTE[cat] ?? CATEGORY_PALETTE.default;

export const CATEGORIES = [
  'Realidad Virtual',
  'DevOps',
  'Control de Versiones',
  'Desarrollo Frontend',
  'Desarrollo Backend',
  'Bases de Datos',
  'Gestión de Proyectos',
  'Seguridad',
  'Inteligencia Artificial',
  'Redes',
  'Sistemas Operativos',
];

export const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Manuales', href: '/manuales' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Galería', href: '/galeria' },
  { label: 'Nosotros', href: '/nosotros' },
];

export const SOFTLAB_INFO = {
  name: 'Softlab',
  fullName: 'Semillero de Investigación Softlab',
  institution: 'Corporación Universitaria Autónoma del Cauca',
  faculty: 'Facultad de Ingeniería de Software y Computación',
  department: 'Ingeniería de Software',
  description:
    'Semillero de investigación dedicado al desarrollo de software, documentación técnica y capacitación en tecnologías emergentes.',
  email: 'softlab@uniautonoma.edu.co',
  location: 'Popayán, Cauca, Colombia',
  year: 2024,
};
