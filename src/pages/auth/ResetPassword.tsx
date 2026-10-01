import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button } from '../../components/ui';
import { useState } from 'react';
import { useToast } from '../../state/ToastContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (pw.length < 8) errs.pw = 'Minimum 8 characters';
    if (pw !== confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      push('Password updated. Please log in.', 'success');
      navigate('/login');
    }, 400);
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="It should be at least 8 characters and easy for you to remember."
      footer={<><Link to="/login" className="text-brand-600 hover:underline">Back to log in</Link></>}
    >
      <form onSubmit={submit} noValidate>
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