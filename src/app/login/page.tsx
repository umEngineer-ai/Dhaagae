'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push(redirect);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="bg-ivory px-4"
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" className="text-brand" style={{ fontSize: '1.4rem', textDecoration: 'none' }}>
            DHAAGAÉ
          </Link>
          <h1 className="display-sm text-plum" style={{ marginTop: '12px', fontSize: '1.6rem' }}>
            Welcome back
          </h1>
          <p className="text-muted" style={{ marginTop: '6px', fontSize: '14px' }}>
            Sign in to your account
          </p>
        </div>

        <div className="card card-xl" style={{ padding: '36px' }}>
          {error && (
            <div
              className="badge badge-error"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', textTransform: 'none', letterSpacing: 0 }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="email" className="label">Email Address</label>
              <div className="input-group">
                <svg className="input-prefix-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="ayesha@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" className="label">Password</label>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--plum-royal)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-group input-group-suffix">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-suffix-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-white spinner-sm" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="divider-ornament" style={{ margin: '24px 0', fontSize: '11px' }}>or</div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--earth-taupe)' }}>
            New to DHAAGAÉ?{' '}
            <Link href="/register" style={{ color: 'var(--plum-royal)', fontWeight: 500, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>

        {/* Admin note */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--earth-taupe)', marginTop: '20px' }}>
          Admin?{' '}
          <span style={{ color: 'var(--plum-royal)' }}>Use your admin credentials above</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner spinner-lg" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
