import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RightNowThink from '../components/RightNowThink';
import './Layout.css';

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, updateUser } = useContext(AuthContext);

  return (
    <div className="layout">
      <Header onMenuToggle={() => setSidebarOpen(v => !v)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="layout__main">
        <RightNowThink
          value={user?.rightNowIThink || ''}
          onChange={(val) => updateUser({ rightNowIThink: val })}
        />
        <div className="layout__content page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
