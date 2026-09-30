import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Nav() {
  const { email, name, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="masthead">
      <div className="masthead-top">
        <div>
          <h1>Ledger</h1>
          <p className="sub">A running record of what you've spent.</p>
        </div>
        <div className="account-bar">
          {name && <span className="account-email">{name}</span>}
          <button type="button" className="clear-link" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
      <nav className="tabs">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          New entry
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => (isActive ? 'active' : '')}>
          All entries
        </NavLink>
      </nav>
    </header>
  );
}
