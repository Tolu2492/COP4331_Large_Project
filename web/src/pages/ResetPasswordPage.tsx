// Password reset completion page that accepts a token from the user's email link.
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const payload = useMemo(() => ({ email: params.get('email') || '', token: params.get('token') || '' }), [params]);

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
          const data = await api<{ message: string }>('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, password })
          });
          setMessage(data.message);
        }}
      >
        <h1>Choose a new password</h1>
        <label>New password</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {messageElement}
        <button className="primary-btn" type="submit">Reset Password</button>
      </form>
    </section>
  );
}
