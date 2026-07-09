import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Archive, KeyRound } from 'lucide-react';
import { AxiosError } from 'axios';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

const DEFAULT_EMAIL = 'admin@ethara.ai';
const DEFAULT_PASSWORD = 'Admin@123';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setServerError(
        axiosErr.response?.data?.error || 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafaf8',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: '24px 16px',
      }}
    >
      <div
        className="animate-slide-up"
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div
            style={{
              width: 38,
              height: 38,
              background: '#c0392b',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Archive size={19} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', letterSpacing: '-0.01em' }}>
              Stockwise
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#9a9a9a', letterSpacing: '0.02em' }}>
              Admin Console
            </div>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 5 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#8a8a8a' }}>
            Sign in to your account to continue.
          </p>
        </div>

        {/* Default credentials info bar */}
        <div
          style={{
            background: '#fdf2f1',
            border: '1px solid #f5c0bb',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 24,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <KeyRound size={15} color="#c0392b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c0392b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Default Credentials
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', gap: 6, fontSize: '0.8125rem' }}>
                <span style={{ color: '#8a8a8a', minWidth: 64 }}>Email</span>
                <span
                  style={{
                    fontFamily: "'DM Mono', 'Fira Code', monospace",
                    color: '#1a1a1a',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                  }}
                >
                  {DEFAULT_EMAIL}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: '0.8125rem' }}>
                <span style={{ color: '#8a8a8a', minWidth: 64 }}>Password</span>
                <span
                  style={{
                    fontFamily: "'DM Mono', 'Fira Code', monospace",
                    color: '#1a1a1a',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                  }}
                >
                  {DEFAULT_PASSWORD}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {serverError && (
          <div className="alert-error animate-fade-in" style={{ marginBottom: 18 }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="off"
                placeholder="you@company.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p style={{ marginTop: 5, fontSize: '0.75rem', color: '#c0392b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={11} />{errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  placeholder="Enter your password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  style={{ paddingRight: 42 }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#b0b0b0',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ marginTop: 5, fontSize: '0.75rem', color: '#c0392b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={11} />{errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '11px', fontSize: '0.9375rem', marginTop: 4 }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }} />
                  Signing in…
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <p style={{ marginTop: 28, textAlign: 'center', fontSize: '0.75rem', color: '#b0b0b0' }}>
          © {new Date().getFullYear()} Stockwise · All rights reserved
        </p>
      </div>
    </div>
  );
}
