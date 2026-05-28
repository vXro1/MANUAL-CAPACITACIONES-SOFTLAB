import { lazy, Suspense } from 'react';
import { createBrowserRouter, useRouteError, Link } from 'react-router-dom';
import { MainLayout }  from '@/app/layouts/MainLayout';
import { Spinner }     from '@/shared/ui/Spinner';

// ─── Lazy pages — públicas ─────────────────────────────────────────────────────
const HomePage            = lazy(() => import('@/pages/HomePage/HomePage')            .then(m => ({ default: m.HomePage })));
const ManualsPage         = lazy(() => import('@/pages/ManualsPage/ManualsPage')      .then(m => ({ default: m.ManualsPage })));
const ManualDetailPage    = lazy(() => import('@/pages/ManualDetailPage/ManualDetailPage').then(m => ({ default: m.ManualDetailPage })));
const AboutPage           = lazy(() => import('@/pages/AboutPage/AboutPage')          .then(m => ({ default: m.AboutPage })));
const GalleryPage         = lazy(() => import('@/pages/GalleryPage/GalleryPage')      .then(m => ({ default: m.GalleryPage })));
const EventsPage          = lazy(() => import('@/pages/EventsPage/EventsPage')        .then(m => ({ default: m.EventsPage })));
const EventDetailPage     = lazy(() => import('@/pages/EventsPage/EventDetailPage')   .then(m => ({ default: m.EventDetailPage })));
const ParticipantDetailPage = lazy(() => import('@/pages/ParticipantDetailPage/ParticipantDetailPage').then(m => ({ default: m.ParticipantDetailPage })));
const DirectorDetailPage  = lazy(() => import('@/pages/DirectorDetailPage/DirectorDetailPage').then(m => ({ default: m.DirectorDetailPage })));

// ─── Lazy pages — admin (chunk separado, jamás en el bundle principal) ─────────
const AdminLayout           = lazy(() => import('@/pages/AdminPage/AdminLayout')           .then(m => ({ default: m.AdminLayout })));
const AdminDashboard        = lazy(() => import('@/pages/AdminPage/AdminDashboard')        .then(m => ({ default: m.AdminDashboard })));
const AdminManualsPage      = lazy(() => import('@/pages/AdminPage/AdminManualsPage')      .then(m => ({ default: m.AdminManualsPage })));
const AdminNewManualPage    = lazy(() => import('@/pages/AdminPage/AdminNewManualPage')    .then(m => ({ default: m.AdminNewManualPage })));
const AdminParticipantsPage = lazy(() => import('@/pages/AdminPage/AdminParticipantsPage').then(m => ({ default: m.AdminParticipantsPage })));
const AdminNewParticipantPage = lazy(() => import('@/pages/AdminPage/AdminNewParticipantPage').then(m => ({ default: m.AdminNewParticipantPage })));
const AdminGalleryPage      = lazy(() => import('@/pages/AdminPage/AdminGalleryPage')      .then(m => ({ default: m.AdminGalleryPage })));
const AdminEventsPage       = lazy(() => import('@/pages/AdminPage/AdminEventsPage')       .then(m => ({ default: m.AdminEventsPage })));
const AdminNewEventPage     = lazy(() => import('@/pages/AdminPage/AdminNewEventPage')     .then(m => ({ default: m.AdminNewEventPage })));
const AdminDirectors        = lazy(() => import('@/pages/AdminPage/AdminDirectors')        .then(m => ({ default: m.AdminDirectors })));

// ─── Fallback de carga ────────────────────────────────────────────────────────
function PageFallback() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Spinner />
    </div>
  );
}

function withSuspense(Component) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
}

// ─── Página de error genérica ─────────────────────────────────────────────────
function ErrorPage() {
  const error = useRouteError();
  const is404 = error?.status === 404;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F8FAFF', padding: '40px 20px', textAlign: 'center',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <p style={{
        fontSize: 72, fontWeight: 800, color: '#E2E8F0',
        fontFamily: 'Syne, sans-serif', lineHeight: 1, margin: '0 0 12px',
      }}>
        {is404 ? '404' : 'Error'}
      </p>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A0F1E', margin: '0 0 8px' }}>
        {is404 ? 'Página no encontrada' : 'Algo salió mal'}
      </h1>
      <p style={{ fontSize: 14, color: '#64748B', maxWidth: 360, margin: '0 0 28px', lineHeight: 1.6 }}>
        {is404
          ? 'La página que buscas no existe o fue movida.'
          : 'Ocurrió un error inesperado. Intenta recargar la página.'}
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 24px', background: '#1A3FAA', color: '#fff',
          borderRadius: 12, textDecoration: 'none',
          fontSize: 14, fontWeight: 600,
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true,              element: withSuspense(HomePage) },
      { path: 'manuales',         element: withSuspense(ManualsPage) },
      { path: 'manuales/:id',     element: withSuspense(ManualDetailPage) },
      { path: 'nosotros',         element: withSuspense(AboutPage) },
      { path: 'galeria',          element: withSuspense(GalleryPage) },
      { path: 'eventos',          element: withSuspense(EventsPage) },
      { path: 'eventos/:id',      element: withSuspense(EventDetailPage) },
      { path: 'participantes/:slug', element: withSuspense(ParticipantDetailPage) },
      { path: 'directivos/:id',   element: withSuspense(DirectorDetailPage) },
    ],
  },
  {
    path: '/panel-softlab-admin',
    element: (
      <Suspense fallback={<PageFallback />}>
        <AdminLayout />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true,                    element: withSuspense(AdminDashboard) },
      { path: 'manuales',               element: withSuspense(AdminManualsPage) },
      { path: 'manuales/nuevo',         element: withSuspense(AdminNewManualPage) },
      { path: 'participantes',          element: withSuspense(AdminParticipantsPage) },
      { path: 'participantes/nuevo',    element: withSuspense(AdminNewParticipantPage) },
      { path: 'galeria',                element: withSuspense(AdminGalleryPage) },
      { path: 'directivos',             element: withSuspense(AdminDirectors) },
      { path: 'eventos',                element: withSuspense(AdminEventsPage) },
      { path: 'eventos/nuevo',          element: withSuspense(AdminNewEventPage) },
    ],
  },
]);
