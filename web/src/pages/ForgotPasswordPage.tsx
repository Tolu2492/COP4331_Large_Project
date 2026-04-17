// Password recovery request page that triggers the reset email flow.
import { useState } from 'react';
import { api } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  let messageElement = null;
  if (message) {
    messageElement = <div className="message success">{message}</div>;
  }

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = await api<{ message: string }>('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          setMessage(data.message);
        }}
      >
        <h1>Reset password</h1>
        <label>Email</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        {messageElement}
        <button className="primary-btn" type="submit">Send Reset Email</button>
      </form>
    </section>
  );
}
