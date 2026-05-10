import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import { Outlet } from 'react-router';

export default function Layout() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--gp-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 w-full">
        <Topbar />
        <main className="flex-1 px-3 sm:px-5 lg:px-8 py-4 sm:py-6 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
