'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password, form.phone);
      if (result.success) {
        router.push('/account');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="bg-ivory px-4 py-12"
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" className="text-brand" style={{ fontSize: '1.4rem', textDecoration: 'none' }}>
            DHAAGAÉ
          </Link>
          <h1 className="display-sm text-plum" style={{ marginTop: '12px', fontSize: '1.6rem' }}>
            Create your account
          </h1>
          <p className="text-muted" style={{ marginTop: '6px', fontSize: '14px' }}>
            Join thousands of families who trust DHAAGAÉ
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

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label htmlFor="name" className="label">Full Name</label>
              <div className="input-group">
                <svg className="input-prefix-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  placeholder="Ayesha Khan"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="label">Email Address</label>
              <div className="input-group">
                <svg className="input-prefix-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="ayesha@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="label">Phone <span style={{ color: 'var(--earth-sand)', textTransform: 'none' }}>(optional)</span></label>
              <div className="input-group">
                <svg className="input-prefix-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="+92 300 0000000"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">Password</label>
              <div className="input-group input-group-suffix">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-suffix-icon"
                  onClick={() => setShowPassword(!showPassword)}
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
              <p className="form-hint">At least 8 characters</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirm" className="label">Confirm Password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-white spinner-sm" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--earth-taupe)', marginTop: '24px' }}>
            By creating an account, you agree to our{' '}
            <Link href="/privacy" style={{ color: 'var(--plum-royal)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" style={{ color: 'var(--plum-royal)', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </p>

          <div className="divider-ornament" style={{ margin: '20px 0', fontSize: '11px' }}>or</div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--earth-taupe)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--plum-royal)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
