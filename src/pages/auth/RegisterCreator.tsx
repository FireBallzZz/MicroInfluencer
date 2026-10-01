import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button } from '../../components/ui';
import { useState } from 'react';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';

export default function RegisterCreator() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '', mobile: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Enter your full name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      errs.username = '3-20 letters, numbers or underscores';;
    if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      login('creator');
      push(`Welcome, ${form.fullName.split(' ')[0]}!`, 'success');
      navigate('/creator/dashboard');
    }, 400);
  };

  return (
    <AuthShell
      title="Microwork"
      subtitle="Sign up as a creator — set up your profile to apply to brand campaigns."
      footer={<>Have an account? <Link to="/login" className="text-brand-600 hover:underline">Log in</Link></>}
      variant="creator"
    >
      <form onSubmit={submit} noValidate>
        <FormField label="Full name" error={errors.fullName}>
          <Input
            value={form.fullName}
            onChange={set('fullName')}
            placeholder="Avery Johnson"
            autoComplete="name"
            autoCapitalize="words"
            autoCorrect="off"
            inputMode="text"
            invalid={!!errors.fullName}
          />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            invalid={!!errors.email}
          />
        </FormField>
        <FormField label="Username" error={errors.username} helper="3-20 characters, letters, numbers or underscores">
          <Input
            value={form.username}
            onChange={set('username')}
            placeholder="avery"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            invalid={!!errors.username}
          />
        </FormField>
        <FormField label="Mobile number" helper="Optional · for collaboration reminders">
          <Input
            type="tel"
            value={form.mobile}
            onChange={set('mobile')}
            placeholder="+1 555 0123"
            autoComplete="tel"
            inputMode="tel"
          />
        </FormField>
        <FormField label="Password" error={errors.password} helper="At least 8 characters">
          <Input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            autoComplete="new-password"
            invalid={!!errors.password}
          />
        </FormField>
        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create my account'}
        </Button>
      </form>
    </AuthShell>
  );
}