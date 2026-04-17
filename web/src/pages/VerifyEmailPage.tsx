// Email verification page that activates the account and signs the user in automatically.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../state/AuthContext';
import type { User } from '../types';

type VerifyResponse = {
  message: string;
  user: User;
  token: string;
};

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [message, setMessage] = useState('Verifying your email...');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const payload = useMemo(() => ({ email: params.get('email') || '', token: params.get('token') || '' }), [params]);

  useEffect(() => {
    let active = true;

    async function runVerification() {
      if (!payload.email || !payload.token) {
        if (!active) return;
        setStatus('error');
        setMessage('That verification link is missing required information.');
        return;
      }

      try {
        const data = await api<VerifyResponse>('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!active) return;
        setSession(data.user, data.token);
        setStatus('success');
        setMessage(data.message);
        window.setTimeout(() => navigate('/recipes'), 1200);
      } catch (error) {
        if (!active) return;
        setStatus('error');
        setMessage((error as Error).message || 'Verification failed.');
      }
    }

    runVerification();

    return () => {
      active = false;
    };
  }, [navigate, payload, setSession]);

  let description = 'We are confirming your account now.';
  if (status === 'success') {
    description = 'Your account is verified and you will be redirected shortly.';
  } else if (status === 'error') {
    description = 'There was a problem verifying your email.';
  }

  let messageClassName = 'message success';
  if (status === 'error') {
    messageClassName = 'message error';
  }

  let messageElement = null;
  if (message) {
    messageElement = <div className={messageClassName}>{message}</div>;
  }

  let errorAction = null;
  if (status === 'error') {
    errorAction = <Link className="primary-btn" to="/login">Go to login</Link>;
  }

  return (
    <section className="auth-wrap">
      <div className="card auth-card">
        <h1>Verify email</h1>
        <p>{description}</p>
        {messageElement}
        {errorAction}
      </div>
    </section>
  );
}
