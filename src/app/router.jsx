import { createBrowserRouter, useRouteError, Link } from 'react-router-dom';
import { MainLayout }             from '@/app/layouts/MainLayout';
import { AdminLayout }            from '@/pages/AdminPage/AdminLayout';
import { HomePage }               from '@/pages/HomePage/HomePage';
import { ManualsPage }            from '@/pages/ManualsPage/ManualsPage';
import { ManualDetailPage }       from '@/pages/ManualDetailPage/ManualDetailPage';
import { AboutPage }              from '@/pages/AboutPage/AboutPage';
import { GalleryPage }            from '@/pages/GalleryPage/GalleryPage';
import { EventsPage }             from '@/pages/EventsPage/EventsPage';
import { EventDetailPage }           from '@/pages/EventsPage/EventDetailPage';
import { ParticipantDetailPage }     from '@/pages/ParticipantDetailPage/ParticipantDetailPage';
import { AdminDashboard }         from '@/pages/AdminPage/AdminDashboard';
import { AdminManualsPage }       from '@/pages/AdminPage/AdminManualsPage';
import { AdminNewManualPage }     from '@/pages/AdminPage/AdminNewManualPage';
import { AdminParticipantsPage }  from '@/pages/AdminPage/AdminParticipantsPage';
import { AdminNewParticipantPage} from '@/pages/AdminPage/AdminNewParticipantPage';
import { AdminGalleryPage }       from '@/pages/AdminPage/AdminGalleryPage';
import { AdminEventsPage }        from '@/pages/AdminPage/AdminEventsPage';
import { AdminNewEventPage }      from '@/pages/AdminPage/AdminNewEventPage';
import { AdminDirectors }         from '@/pages/AdminPage/AdminDirectors';

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
      { index: true,              element: <HomePage /> },
      { path: 'manuales',         element: <ManualsPage /> },
      { path: 'manuales/:id',     element: <ManualDetailPage /> },
      { path: 'nosotros',         element: <AboutPage /> },
      { path: 'galeria',          element: <GalleryPage /> },
      { path: 'eventos',              element: <EventsPage /> },
      { path: 'eventos/:id',         element: <EventDetailPage /> },
      { path: 'participantes/:id',   element: <ParticipantDetailPage /> },
    ],
  },
  {
    path: '/panel-softlab-admin',
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true,                    element: <AdminDashboard /> },
      { path: 'manuales',               element: <AdminManualsPage /> },
      { path: 'manuales/nuevo',         element: <AdminNewManualPage /> },
      { path: 'participantes',          element: <AdminParticipantsPage /> },
      { path: 'participantes/nuevo',    element: <AdminNewParticipantPage /> },
      { path: 'galeria',                element: <AdminGalleryPage /> },
      { path: 'directivos',             element: <AdminDirectors /> },
      { path: 'eventos',                element: <AdminEventsPage /> },
      { path: 'eventos/nuevo',          element: <AdminNewEventPage /> },
    ],
  },
]);
