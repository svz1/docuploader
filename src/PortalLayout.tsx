import { Outlet } from 'react-router-dom';

function PortalLayout() {
  return (
    <div className="portal-layout">
      <header className="portal-header">
        <h2 className="portal-brand">
          <img src="/welfare-logo-white.png" alt="Welfare Academy" style={{ height: "40px", objectFit: "contain" }} />
        </h2>
        <div>
           <div className="portal-avatar">
             U
           </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default PortalLayout;
