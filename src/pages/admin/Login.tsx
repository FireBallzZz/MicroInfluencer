import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { FormField, Input, Button } from '../../components/ui';
import { useAdminAuth } from '../../state/AdminAuthContext';
import { isApiError } from '../../api/client';

export default function AdminLogin() {
  const { login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const u = await login({ identifier, password });
      if (u.role !== 'admin') {
        setError('This account is not an admin.');
        return;
      }
      navigate('/admin/overview');
    } catch (err) {
      if (isApiError(err) && (err.status === 401 || err.code === 'invalid_credentials')) {
        setError('Incorrect email/username or password.');
      } else if (isApiError(err)) {
        setError(err.message);
      } else {
        setError('Could not log in.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-ink-900 text-paper-50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl text-ink-900 tracking-[-0.02em]">Admin Panel</h1>
          <p className="text-sm text-ink-500 mt-1">Sign in with your admin account.</p>
        </div>
        <form onSubmit={submit} noValidate className="card p-6">
          <FormField label="Email or username" htmlFor="identifier">
            <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="admin" autoComplete="username" autoCapitalize="none" autoCorrect="off" />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </FormField>
          {error && <div className="error mb-3" role="alert">{error}</div>}
          <Button size="lg" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </Button>
          <div className="mt-4 text-xs text-ink-500 text-center">
            <Lock className="w-3 h-3 inline-block mr-1" /> Admin accounts are created by a seed script.
          </div>
        </form>
      </div>
    </div>
  );
}
