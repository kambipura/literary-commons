import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './DevToolbar.css';

const ROLES = ['student', 'professor', 'admin'];

export default function DevToolbar() {
  const { role, setRole } = useContext(AuthContext);

  return (
    <div className="dev-toolbar" aria-label="Developer toolbar">
      <span className="dev-toolbar__label">DEV</span>
      <div className="dev-toolbar__roles">
        {ROLES.map(r => (
          <button
            key={r}
            className={`dev-toolbar__role ${role === r ? 'dev-toolbar__role--active' : ''}`}
            onClick={() => setRole(r)}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
