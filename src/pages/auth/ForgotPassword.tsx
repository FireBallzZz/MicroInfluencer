import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button } from '../../components/ui';
import { useState } from 'react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setTimeout(() => navigate('/verify-code', { state: { email } }), 600);
    }, 400);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email tied to your account. We’ll send you a 6-digit code."
      footer={<><Link to="/login" className="text-brand-600 hover:underline">Back to log in</Link></>}
    >
      {sent ? (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          If an account exists for <strong>{email}</strong>, we’ve sent a 6-digit code.
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <FormField label="Email">
            <Input
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
          <Button size="lg" className="w-full" disabled={loading}>
            {loading ? 'Sending code…' : 'Send reset code'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}