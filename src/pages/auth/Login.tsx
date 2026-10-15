import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button, Label } from '../../components/ui';
import { useState } from 'react';
import { useAuth } from '../../state/AuthContext';
import clsx from 'clsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'creator' | 'brand'>('creator');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      login(role);
      navigate(role === 'creator' ? '/creator/dashboard' : '/brand/dashboard');
    }, 400);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your account. Pick a demo role to continue."
      variant="neutral"
    >
      <div className="grid grid-cols-2 gap-1 p-1 bg-paper-100 border border-ink-200 rounded-md mb-5">
        <button
          onClick={() => setRole('creator')}
          className={clsx(
            'h-9 text-sm font-semibold rounded-sm transition-colors',
            role === 'creator' ? 'bg-ink-900 text-paper-50' : 'text-ink-600 hover:text-ink-900'
          )}
          aria-pressed={role === 'creator'}
        >
          I’m a creator
        </button>
        <button
          onClick={() => setRole('brand')}
          className={clsx(
            'h-9 text-sm font-semibold rounded-sm transition-colors',
            role === 'brand' ? 'bg-ink-900 text-paper-50' : 'text-ink-600 hover:text-ink-900'
          )}
          aria-pressed={role === 'brand'}
        >
          I’m a brand
        </button>
      </div>
      <form onSubmit={submit} noValidate>
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </FormField>
        {error && <div className="error mb-3" role="alert">{error}</div>}
        <div className="flex items-center justify-between text-sm mb-4 gap-2 flex-wrap">
          <label className="flex items-center gap-2 text-ink-700">
            <input type="checkbox" className="rounded accent-ink-900" /> Keep me signed in
          </label>
          <Link to="/forgot-password" className="text-ember-600 hover:text-ember-700 font-semibold">Forgot password?</Link>
        </div>
        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </Button>
      </form>
      <div className="mt-5 text-sm text-ink-500 text-center">
        New here? <Link to="/register/role" className="text-ember-600 hover:text-ember-700 font-semibold">Create an account</Link>
      </div>
    </AuthShell>
  );
}
