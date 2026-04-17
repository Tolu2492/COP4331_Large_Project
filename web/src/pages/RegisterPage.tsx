// Registration page for new Garnish accounts.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  let messageElement = null;
  if (message) {
    messageElement = <div className="message success">{message}</div>;
  }

  let buttonLabel = 'Register';
  if (isSubmitting) {
    buttonLabel = 'Creating account...';
  }

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        onSubmit={async (event) => {
          event.preventDefault();
          const trimmedForm = {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password
          };

          if (!trimmedForm.name || !trimmedForm.email || !trimmedForm.password) {
            setMessage('Name, email, and password are required.');
            return;
          }

          try {
            setIsSubmitting(true);
            const data = await api<{ message: string }>('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(trimmedForm)
            });
            setMessage(data.message);
          } catch (error) {
            setMessage((error as Error).message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <h1>Create your Garnish account</h1>
        <label>Name</label>
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <label>Email</label>
        <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <label>Password</label>
        <input required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        {messageElement}
        <button className="primary-btn" type="submit" disabled={isSubmitting}>{buttonLabel}</button>
        <Link className="text-link" to="/login">Already have an account?</Link>
      </form>
    </section>
  );
}
