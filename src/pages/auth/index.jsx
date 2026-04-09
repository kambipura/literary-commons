import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';

export function Login() {
  const { login, signUp, resetPassword, updatePassword, isRecovering } = useContext(AuthContext);
  const [status, setStatus] = useState('idle'); // idle, submitting, sent, error
  const [mode, setMode] = useState('login'); // login, signup, reset, update_password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [diagnosticError, setDiagnosticError] = useState(null);

  // Catch any URL fragment errors or AuthContext custom events
  React.useEffect(() => {
    if (isRecovering) {
      setMode('update_password');
      setStatus('idle');
    }
    
    // 1. Check URL for Supabase hash errors
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorDesc = hashParams.get('error_description');
    if (errorDesc) {
      setDiagnosticError(`Supabase Link Error: ${errorDesc.replace(/\+/g, ' ')}`);
    }

    // 2. Listen for internal context errors
    const handleContextError = (e) => {
      setDiagnosticError(e.detail);
      setStatus('error');
    };
    window.addEventListener('authError', handleContextError);

    // 3. Detect password recovery link
    if (hashParams.get('type') === 'recovery') {
      setMode('update_password');
      setStatus('idle');
    }
    
    return () => window.removeEventListener('authError', handleContextError);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    setDiagnosticError(null);
    
    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'signup') {
      const result = await signUp(cleanEmail, password);
      if (result?.success) {
        if (result.needsEmailConfirmation) {
          setStatus('sent');
        } else {
          // Do nothing, let AuthContext's onAuthStateChange handle the redirect seamlessly!
        }
      } else {
        setStatus('error');
      }
      return;
    }

    if (mode === 'reset') {
      const success = await resetPassword(cleanEmail);
      if (success) {
        setStatus('sent');
      } else {
        setStatus('error');
      }
      return;
    }

    if (mode === 'update_password') {
      const success = await updatePassword(password);
      if (success) {
        setStatus('idle');
        setMode('login');
        alert('Password updated successfully! Please sign in with your new password.');
      } else {
        setStatus('error');
      }
      return;
    }

    // Login logic
    const success = await login(cleanEmail, password);
    if (!success) setStatus('error');
  };

  if (status === 'sent') {
    return (
      <div className="login-panel page-enter" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-6)' }}>✉️</div>
        <h2 style={{ marginBottom: 'var(--space-3)', fontFamily: 'var(--font-heading)' }}>
          {mode === 'signup' ? 'Verify your account' : 'Check your inbox'}
        </h2>
        <p className="meta" style={{ marginBottom: 'var(--space-8)', lineHeight: 1.6, fontSize: 'var(--text-md)' }}>
          {mode === 'signup' 
            ? "We sent a verification link to your email. Click it to activate your account and start your workshop."
            : `We sent a password reset link to ${email}. Please check your inbox and follow the instructions.`
          }
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
          <Button variant="outline" onClick={() => setStatus('idle')}>
            Back to Login
          </Button>
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
        {mode !== 'reset' && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--paper-3)', marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
            <button 
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setDiagnosticError(null); }}
              style={{ 
                padding: 'var(--space-3) var(--space-2)', 
                background: 'transparent', 
                border: 'none', 
                color: mode === 'login' ? 'var(--gold)' : 'var(--ink-3)',
                borderBottom: mode === 'login' ? '2px solid var(--gold)' : '2px solid transparent',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button 
              className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setDiagnosticError(null); }}
              style={{ 
                padding: 'var(--space-3) var(--space-2)', 
                background: 'transparent', 
                border: 'none', 
                color: mode === 'signup' ? 'var(--gold)' : 'var(--ink-3)',
                borderBottom: mode === 'signup' ? '2px solid var(--gold)' : '2px solid transparent',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Join (New Student)
            </button>
          </div>
        )}

        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
          {mode === 'signup' 
            ? 'Create your Student Account' 
            : (mode === 'reset' ? 'Reset your Password' : (mode === 'update_password' ? 'Set New Password' : 'Sign in to the Commons'))
          }
        </h2>

        {diagnosticError && (
          <div style={{ padding: 'var(--space-4)', background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
            <strong style={{ display: 'block', marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}>Error:</strong>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.4 }}>{diagnosticError}</p>
          </div>
        )}

        {status === 'error' && !diagnosticError && (
          <div style={{ padding: 'var(--space-3)', background: 'var(--error-light)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
            {mode === 'update_password' ? 'Failed to update password. Link may be expired.' : 'Authorization failed. Check your credentials and try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {mode !== 'update_password' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label className="meta" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                className="auth-input"
                placeholder="e.g. s.jordan@example.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error' || diagnosticError) {
                    setStatus('idle');
                    setDiagnosticError(null);
                  }
                }}
                disabled={status === 'submitting'}
                required
                style={{ padding: 'var(--space-4)', fontSize: '16px' }}
              />
            </div>
          )}

          {mode !== 'reset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="meta" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)' }}>PASSWORD</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => setMode('reset')}
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (status === 'error' || diagnosticError) {
                    setStatus('idle');
                    setDiagnosticError(null);
                  }
                }}
                disabled={status === 'submitting'}
                required
                style={{ padding: 'var(--space-4)', fontSize: '16px' }}
              />
            </div>
          )}

          <Button type="submit" disabled={(mode !== 'update_password' && !email) || (mode !== 'reset' && !password) || status === 'submitting'} style={{ width: '100%', justifyContent: 'center', padding: 'var(--space-4)', fontSize: '16px' }}>
            {status === 'submitting' 
              ? 'Processing...' 
              : (mode === 'signup' ? 'Create Account' : (mode === 'reset' ? 'Send Reset Link' : (mode === 'update_password' ? 'Update Password' : 'Sign In')))
            }
          </Button>

          {mode === 'reset' && (
            <button 
              type="button" 
              className="btn-ghost" 
              onClick={() => setMode('login')}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', alignSelf: 'center', opacity: 0.7 }}
            >
              ← Back to Sign In
            </button>
          )}
        </form>
      </div>

      <div style={{ textAlign: 'center', padding: '0 var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-3)', lineHeight: 1.6 }}>
          {mode === 'signup' 
            ? "Already have an account? Sign in above."
            : (mode === 'reset' ? "We'll email you a link to reset your password." : "Use your registered email to access your workspace.")
          }
        </p>
      </div>
    </div>
  );
}
