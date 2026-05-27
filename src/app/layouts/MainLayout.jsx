import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from '@/widgets/Navbar/Navbar';
import { Footer } from '@/widgets/Footer/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen" style={{ overflowX: 'hidden', width: '100%' }}>
      <ScrollToTop />
      <Navbar />
      <div className="flex-1" style={{ minWidth: 0 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
