import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button } from '../../components/ui';
import { useState } from 'react';
import { useAuth } from '../../state/AuthContext';

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
      title="Log in to Microwork"
      subtitle="Welcome back. Pick your demo role to continue."
      side={
        <div>
          <h2 className="text-2xl font-bold text-ink-900">Demo mode</h2>
          <p className="mt-3 text-ink-700 leading-relaxed">
            This is an interactive frontend demo. Pick a role to enter the matching dashboard.
            Your changes are stored locally in your browser.
          </p>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2 p-1 bg-ink-100 rounded-lg mb-5">
        <button
          onClick={() => setRole('creator')}
          className={`py-2 text-sm font-semibold rounded-md ${role === 'creator' ? 'bg-white shadow text-ink-900' : 'text-ink-600'}`}
        >
          I’m a creator
        </button>
        <button
          onClick={() => setRole('brand')}
          className={`py-2 text-sm font-semibold rounded-md ${role === 'brand' ? 'bg-white shadow text-ink-900' : 'text-ink-600'}`}
        >
          I’m a brand
        </button>
      </div>
      <form onSubmit={submit}>
        <FormField label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </FormField>
        <FormField label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </FormField>
        {error && <div className="error mb-3">{error}</div>}
        <div className="flex items-center justify-between text-sm mb-4">
          <label className="flex items-center gap-2 text-ink-700">
            <input type="checkbox" className="rounded" /> Keep me signed in
          </label>
          <Link to="/forgot-password" className="text-brand-600 hover:underline">Forgot password?</Link>
        </div>
        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </Button>
      </form>
      <div className="mt-5 text-sm text-ink-600 text-center">
        New here? <Link to="/register/role" className="text-brand-600 hover:underline">Create an account</Link>
      </div>
    </AuthShell>
  );
}