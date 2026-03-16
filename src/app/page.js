'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (admin) {
      router.push('/companies');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div
      className="container animate-fade-in-up"
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '540px',
          width: '100%',
          textAlign: 'center',
          padding: '2.25rem 2rem',
        }}
      >
        <p
          className="text-muted"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            fontSize: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          Redirecting
        </p>
        <h2 style={{ marginBottom: '0.5rem' }}>Preparing your B2B workspace</h2>
        <p
          className="page-subtitle"
          style={{ margin: '0 auto 1.75rem', textAlign: 'center' }}
        >
          Checking your admin session and routing you to the right place.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '999px',
              border: '1px solid rgba(148,163,184,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              className="animate-pulse"
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: 'inherit',
                border: '1px dashed rgba(148,163,184,0.45)',
                opacity: 0.65,
              }}
            />
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 'inherit',
                background:
                  'conic-gradient(from 220deg, rgba(56,189,248,1), rgba(129,140,248,1), rgba(34,197,94,1), rgba(56,189,248,1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 8px rgba(15,23,42,0.9)',
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 'inherit',
                  background:
                    'radial-gradient(circle at top left, #0f172a, #020617)',
                }}
              />
            </div>
          </div>

          <p
            className="text-muted animate-pulse"
            style={{
              fontSize: '0.9rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Loading B2B Portal…
          </p>
        </div>
      </div>
    </div>
  );
}
