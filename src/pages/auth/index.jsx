import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';

export function Login() {
  const { login } = useContext(AuthContext);
  const [status, setStatus] = useState('idle'); // idle, submitting, sent, error
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState(null);

  // Catch any URL fragment errors or AuthContext custom events
  React.useEffect(() => {
    // 1. Check URL for Supabase hash errors
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorDesc = hashParams.get('error_description');
    if (errorDesc) {
      setDiagnosticError(`Supabase Link Error: ${errorDesc.replace(/\+/g, ' ')}`);
    }

    // 2. Listen for internal context errors
    const handleContextError = (e) => setDiagnosticError(`Database Error: ${e.detail}`);
    window.addEventListener('authError', handleContextError);
    return () => window.removeEventListener('authError', handleContextError);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    
    // Call the real Supabase Auth login (OTP or Password)
    const success = await login(email, usePassword ? password : null);
    
    if (success) {
      if (usePassword) {
        // Password login redirects automatically via AuthContext/App
        return;
      }
      setStatus('sent');
    } else {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="login-panel page-enter" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-6)' }}>✉️</div>
        <h2 style={{ marginBottom: 'var(--space-3)', fontFamily: 'var(--font-heading)' }}>Check your inbox</h2>
        <p className="meta" style={{ marginBottom: 'var(--space-8)', lineHeight: 1.6, fontSize: 'var(--text-md)' }}>
          We sent a secure magic link to <strong style={{ color: 'var(--gold)' }}>{email}</strong>.<br/>
          Click the link to sign in instantly.
        </p>
        
        <div style={{ marginTop: 'var(--space-6)' }}>
          <button 
            className="btn-ghost" 
            onClick={() => { setStatus('idle'); setEmail(''); }}
            style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-3)', textDecoration: 'underline' }}
          >
            Entered the wrong email? Start over.
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-panel page-enter">
      <div style={{ marginBottom: 'var(--space-10)', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block', 
          padding: '4px 12px', 
          background: 'var(--gold-bg)', 
          color: 'var(--gold)', 
          borderRadius: '20px', 
          fontSize: '10px', 
          fontWeight: 'bold',
          letterSpacing: '1px',
          marginBottom: 'var(--space-4)',
          border: '1px solid var(--gold-border)'
        }}>
          BETA v1.0
        </div>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: 'var(--text-3xl)', 
          letterSpacing: '-0.02em',
          marginBottom: 'var(--space-2)'
        }}>
          Literary Commons
        </h1>
        <p className="meta" style={{ fontSize: 'var(--text-md)' }}>
          A digital space for dialogic reading and writing.
        </p>
      </div>

      <div style={{ 
        background: 'var(--paper-2)', 
        padding: 'var(--space-6)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--paper-3)',
        marginBottom: 'var(--space-6)'
      }}>
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
          {usePassword ? 'Staff Sign In' : 'Sign In to your Workshop'}
        </h2>

        {diagnosticError && (
          <div style={{ padding: 'var(--space-4)', background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>Connection Issue:</strong>
            {diagnosticError}
          </div>
        )}

        {status === 'error' && !diagnosticError && (
          <div style={{ padding: 'var(--space-3)', background: 'var(--error-light)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
            Authorization failed. Check your email and try again.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label className="meta" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)' }}>UNIVERSITY EMAIL</label>
            <input
              type="email"
              className="auth-input"
              placeholder="e.g. s.jordan@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              disabled={status === 'submitting'}
              required
              style={{ padding: 'var(--space-4)', fontSize: '16px' }}
            />
          </div>

          {usePassword && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label className="meta" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)' }}>PASSWORD</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'submitting'}
                required
                style={{ padding: 'var(--space-4)', fontSize: '16px' }}
              />
            </div>
          )}

          <Button type="submit" disabled={!email || (usePassword && !password) || status === 'submitting'} style={{ width: '100%', justifyContent: 'center', padding: 'var(--space-4)', fontSize: '16px' }}>
            {status === 'submitting' ? 'Verifying...' : (usePassword ? 'Sign In' : 'Send Magic Link')}
          </Button>

          <button 
            type="button" 
            className="btn-ghost" 
            onClick={() => setUsePassword(!usePassword)}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', alignSelf: 'center', opacity: 0.7 }}
          >
            {usePassword ? '← Sign in with Magic Link' : 'Admin: Sign in with Password'}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', padding: '0 var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-3)', lineHeight: 1.6 }}>
          New to the commons? Enter your university email above. <br/>
          A student profile will be created automatically on your first visit.
        </p>
      </div>
    </div>
  );
}
