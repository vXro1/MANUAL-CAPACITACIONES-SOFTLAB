import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/app/layouts/MainLayout';
import { AdminLayout } from '@/pages/AdminPage/AdminLayout';
import { HomePage } from '@/pages/HomePage/HomePage';
import { ManualsPage } from '@/pages/ManualsPage/ManualsPage';
import { ManualDetailPage } from '@/pages/ManualDetailPage/ManualDetailPage';
import { AboutPage } from '@/pages/AboutPage/AboutPage';
import { GalleryPage } from '@/pages/GalleryPage/GalleryPage';
import { AdminDashboard } from '@/pages/AdminPage/AdminDashboard';
import { AdminManualsPage } from '@/pages/AdminPage/AdminManualsPage';
import { AdminNewManualPage } from '@/pages/AdminPage/AdminNewManualPage';
import { AdminParticipantsPage } from '@/pages/AdminPage/AdminParticipantsPage';
import { AdminNewParticipantPage } from '@/pages/AdminPage/AdminNewParticipantPage';
import { AdminGalleryPage } from '@/pages/AdminPage/AdminGalleryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'manuales', element: <ManualsPage /> },
      { path: 'manuales/:id', element: <ManualDetailPage /> },
      { path: 'nosotros', element: <AboutPage /> },
      { path: 'galeria', element: <GalleryPage /> },
    ],
  },
  {
    path: '/panel-softlab-admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'manuales', element: <AdminManualsPage /> },
      { path: 'manuales/nuevo', element: <AdminNewManualPage /> },
      { path: 'participantes', element: <AdminParticipantsPage /> },
      { path: 'participantes/nuevo', element: <AdminNewParticipantPage /> },
      { path: 'galeria', element: <AdminGalleryPage /> },
    ],
  },
]);
