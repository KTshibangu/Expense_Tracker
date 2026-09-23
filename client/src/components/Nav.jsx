import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <header className="masthead">
      <h1>Ledger</h1>
      <p className="sub">A running record of what I've spent.</p>
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