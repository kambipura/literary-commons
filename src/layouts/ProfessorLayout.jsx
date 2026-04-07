import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import './Layout.css';

export default function ProfessorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout" style={{ '--accent': 'var(--gold)', '--accent-hover': 'var(--gold-hover)', '--accent-light': 'var(--gold-light)' }}>
      <Header onMenuToggle={() => setSidebarOpen(v => !v)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="layout__main">
        <div className="layout__content page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
