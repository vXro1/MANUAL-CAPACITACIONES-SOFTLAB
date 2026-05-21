import { Outlet } from 'react-router-dom';
import { Navbar } from '@/widgets/Navbar/Navbar';
import { Footer } from '@/widgets/Footer/Footer';

export function MainLayout() {
  return (
    // Sin overflow ni altura fija — el body/html manejan el scroll de la página
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
