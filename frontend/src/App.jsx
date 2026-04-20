import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import AdminView from './pages/AdminView';
import StationView from './pages/StationView';
import GuestView from './pages/GuestView';
import QRDisplayPage from './pages/QRDisplayPage';
import OrderPage from './pages/OrderPage';
import './index.css';

// The /order and /guest routes are customer-facing; hide the staff nav bar on them.
function Layout() {
  const { pathname } = useLocation();
  const isCustomerPage = pathname === '/order';

  return (
    <div className="app-shell">
      {!isCustomerPage && (
        <nav className="nav-bar">
          <span className="nav-logo">VibeEvents</span>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Admin
            </NavLink>
            <NavLink to="/qr" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              QR Code
            </NavLink>
            <NavLink to="/station" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Station
            </NavLink>
            <NavLink to="/guest" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Track Order
            </NavLink>
          </div>
        </nav>
      )}

      <main className={isCustomerPage ? 'main-content' : 'main-content'}>
        <Routes>
          <Route path="/"        element={<AdminView />} />
          <Route path="/qr"      element={<QRDisplayPage />} />
          <Route path="/station" element={<StationView />} />
          <Route path="/guest"   element={<GuestView />} />
          {/* Customer-facing order page – linked via QR code */}
          <Route path="/order"   element={<OrderPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
