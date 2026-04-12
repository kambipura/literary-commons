import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import './Layout.css';

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <div className="layout">
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

