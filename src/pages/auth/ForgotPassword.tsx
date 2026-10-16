import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button } from '../../components/ui';
import { useState } from 'react';
import { useToast } from '../../state/ToastContext';
import { ApiError, isApiError } from '../../api/client';
import { requestPasswordReset } from '../../api/endpoints';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      setTimeout(() => navigate('/verify-code', { state: { email } }), 600);
    } catch (err) {
      // The backend always returns 200 with a generic message. Surface anything else.
      if (isApiError(err)) {
        push(err.message, 'error');
      } else {
        push('Could not send a reset code. Try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Microwork"
      subtitle="Reset your password — enter the email tied to your account and we’ll send a 6-digit code."
      footer={<><Link to="/login" className="text-ember-600 hover:text-ember-700 font-semibold">Back to log in</Link></>}
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
