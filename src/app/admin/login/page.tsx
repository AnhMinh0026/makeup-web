'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? 'Đăng nhập thất bại.');
        return;
      }

      router.replace('/admin');
    } catch {
      setError('Không thể kết nối server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow behind card */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo / Brand */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          EMISA MAKEUP
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.22)',
            fontSize: '0.58rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginTop: '0.35rem',
          }}
        >
          Admin Panel
        </p>
      </div>

      {/* Card */}
      <Card
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CardHeader style={{ paddingBottom: '0.5rem' }}>
          <p
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Đăng nhập để tiếp tục
          </p>
        </CardHeader>

        <CardContent style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Username field */}
            <div style={{ position: 'relative' }}>
              <User
                size={14}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.3)',
                  pointerEvents: 'none',
                }}
              />
              <Input
                id="admin-username"
                type="text"
                placeholder="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
                style={{
                  paddingLeft: '36px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.875rem',
                  height: '42px',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {/* Password field */}
            <div style={{ position: 'relative' }}>
              <Lock
                size={14}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.3)',
                  pointerEvents: 'none',
                }}
              />
              <Input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
                style={{
                  paddingLeft: '36px',
                  paddingRight: '40px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.875rem',
                  height: '42px',
                  transition: 'border-color 0.2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(220,38,38,0.1)',
                  border: '1px solid rgba(220,38,38,0.25)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.75rem',
                  color: 'rgba(252,165,165,0.9)',
                  fontSize: '0.75rem',
                }}
              >
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              id="admin-login-btn"
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: '100%',
                height: '42px',
                background: loading || !username || !password
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(255,255,255,0.92)',
                color: loading || !username || !password
                  ? 'rgba(255,255,255,0.25)'
                  : '#0a0a0a',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>

          </form>
        </CardContent>
      </Card>

      {/* Footer note */}
      <p
        style={{
          marginTop: '2rem',
          color: 'rgba(255,255,255,0.12)',
          fontSize: '0.55rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        Protected — EMISA MAKEUP © 2026
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.22) !important; }
        input:focus { outline: none; border-color: rgba(255,255,255,0.3) !important; }
      `}</style>
    </main>
  );
}
