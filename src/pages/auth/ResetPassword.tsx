import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button } from '../../components/ui';
import { useState } from 'react';
import { useToast } from '../../state/ToastContext';
import { useLocation } from 'react-router-dom';
import { confirmPasswordReset } from '../../api/endpoints';
import { isApiError } from '../../api/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? '';
  const { push } = useToast();
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (code.length !== 6) errs.code = 'Enter the 6-digit code';
    if (pw.length < 8) errs.pw = 'Minimum 8 characters';
    if (pw !== confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!email) {
      setErrors({ code: 'Start from the "Forgot password" page' });
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset({ email, code, newPassword: pw });
      push('Password updated. Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      if (isApiError(err)) setErrors({ code: err.message });
      else setErrors({ code: 'Could not update password. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Microwork"
      subtitle="Enter the 6-digit code we emailed you and choose a new password."
      footer={<><Link to="/login" className="text-ember-600 hover:text-ember-700 font-semibold">Back to log in</Link></>}
    >
      <form onSubmit={submit} noValidate>
        <FormField label="6-digit code" error={errors.code} helper={`Sent to ${email || 'your email'}`}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            invalid={!!errors.code}
          />
        </FormField>
        <FormField label="New password" error={errors.pw}>
          <Input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            invalid={!!errors.pw}
          />
        </FormField>
        <FormField label="Confirm password" error={errors.confirm}>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            invalid={!!errors.confirm}
          />
        </FormField>
        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  );
}
