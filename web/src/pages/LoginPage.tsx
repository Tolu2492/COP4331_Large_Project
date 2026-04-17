// Sign-in page for existing Garnish users.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../state/AuthContext';
import type { User } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  let messageElement = null;
  if (message) {
    messageElement = <div className="message error">{message}</div>;
  }

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            const data = await api<{ user: User; token: string }>('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form)
            });
            setSession(data.user, data.token);
            navigate('/recipes');
          } catch (error) {
            setMessage((error as Error).message);
          }
        }}
      >
        <h1>Welcome back</h1>
        <p>Use your verified email to continue.</p>
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        {messageElement}
        <button className="primary-btn" type="submit">Login</button>
        <Link className="text-link" to="/forgot-password">Forgot password?</Link>
      </form>
    </section>
  );
}
