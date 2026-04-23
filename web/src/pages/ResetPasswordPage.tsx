// Password reset completion page that accepts a token from the user's email link.
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const payload = useMemo(() => ({ email: params.get('email') || '', token: params.get('token') || '' }), [params]);

  let messageElement = null;
  if (message) {
    const className = messageType === 'error' ? 'message error' : 'message success';
    messageElement = <div className={className}>{message}</div>;
  }

  let loginLink = null;
  if (messageType === 'success' && message) {
    loginLink = <Link className="text-link" to="/login">Back to login</Link>;
  }

  return (
    <section className="auth-wrap">
      <form
        className="card auth-card"
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            const data = await api<{ message: string }>('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...payload, password })
            });
            setMessageType('success');
            setMessage(data.message);
          } catch (error) {
            setMessageType('error');
            setMessage((error as Error).message);
          }
        }}
      >
        <h1>Choose a new password</h1>
        <label>New password</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {messageElement}
        {loginLink}
        <button className="primary-btn" type="submit">Reset Password</button>
      </form>
    </section>
  );
}
