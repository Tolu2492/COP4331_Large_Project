import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  let messageElement = null;
  if (message) {
    let messageClassName = 'message success';
    if (isError) {
      messageClassName = 'message error';
    }

    messageElement = <div className={messageClassName}>{message}</div>;
  }

  let buttonLabel = 'Register';
  if (isSubmitting) {
    buttonLabel = 'Creating account...';
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password
    };

    if (!trimmedForm.name || !trimmedForm.email || !trimmedForm.password) {
      setIsError(true);
      setMessage('Name, email, and password are required.');
      return;
    }

    if (trimmedForm.password.length < 8) {
      setIsError(true);
      setMessage('Password must be at least 8 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsError(false);
      setMessage('');

      const data = await api<{ message: string }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedForm)
      });

      setIsError(false);
      setMessage(data.message);
      setForm({
        name: '',
        email: '',
        password: ''
      });
    } catch (error) {
      setIsError(true);
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Create your Garnish account</h1>

        <label htmlFor="register-name">Name</label>
        <input
          id="register-name"
          required
          autoComplete="name"
          value={form.name}
          onChange={(event) =>
            setForm({
              ...form,
              name: event.target.value
            })
          }
        />

        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          required
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) =>
            setForm({
              ...form,
              email: event.target.value
            })
          }
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(event) =>
            setForm({
              ...form,
              password: event.target.value
            })
          }
        />

        {messageElement}

        <button className="primary-btn" type="submit" disabled={isSubmitting}>
          {buttonLabel}
        </button>

        <Link className="text-link" to="/login">
          Already have an account?
        </Link>
      </form>
    </section>
  );
}