'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save admin to local storage
        localStorage.setItem('admin', JSON.stringify(data.user));
        router.push('/companies');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container animate-fade-in-up"
      style={{
        minHeight: '70vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.95fr)',
        gap: '3rem',
        alignItems: 'center',
      }}
    >
      <section className="animate-fade-in-up delay-100" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p
          className="text-muted"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            fontSize: '0.75rem',
          }}
        >
          Admin Console
        </p>
        <h1 style={{ marginBottom: '0.25rem' }}>Control your B2B credit rails.</h1>
        <p className="page-subtitle">
          Log in to manage companies, tweak credit limits, and approve large orders in a
          realtime, credit-first B2B environment.
        </p>

        <div
          className="card animate-fade-in-up delay-200"
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '1.25rem',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            maxWidth: '420px',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '999px',
              background:
                'conic-gradient(from 220deg, rgba(52,211,153,1), rgba(56,189,248,1), rgba(129,140,248,1), rgba(52,211,153,1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 'inherit',
                background: 'radial-gradient(circle at top left,#0f172a,#020617)',
              }}
            />
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 500 }}>Smart credit engine</span>
            <p className="text-muted" style={{ marginTop: 2 }}>
              Simulated approvals, repayments and pricing – all wired to your backend.
            </p>
          </div>
        </div>
      </section>

      <section
        className="card animate-fade-in-up delay-150"
        style={{
          maxWidth: 420,
          width: '100%',
          marginLeft: 'auto',
        }}
      >
        <h2 style={{ textAlign: 'left' }}>Admin portal login</h2>
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>
          Use your admin credentials to access the Nova B2B console.
        </p>

        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@portal.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div
              className="text-error animate-fade-in-up"
              style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary animate-fade-in-up delay-200"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {loading ? 'Signing in…' : 'Sign in to console'}
          </button>
        </form>
      </section>
    </div>
  );
}
