// Main site chrome that wraps pages with navigation, decorative background, and consistent spacing.
import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../state/AuthContext';
import BackgroundCarousel from './BackgroundCarousel';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <BackgroundCarousel />
      <header className="topbar">
        <Link className="brand" to="/">Garnish</Link>
        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/recipes">Recipes</NavLink>
          <NavLink to="/favorites">Favorites</NavLink>
          <NavLink to="/pantry">Pantry</NavLink>
          <NavLink to="/recipes/new">Add Recipe</NavLink>
        </nav>
        <div className="auth-actions">
          {user ? (
            <>
              <span className="welcome">Hi, {user.name}</span>
              <button className="ghost-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="ghost-btn" to="/login">Login</Link>
              <Link className="primary-btn" to="/register">Get Started</Link>
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
