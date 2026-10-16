import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button } from '../../components/ui';
import { useState } from 'react';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';
import { ApiError } from '../../api/client';

export default function RegisterCreator() {
  const { registerCreator, login, loading } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '', mobile: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Enter your full name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      errs.username = '3-20 letters, numbers or underscores';
    if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (!form.mobile.trim()) errs.mobile = 'Enter a mobile number';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await registerCreator({
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        password: form.password,
        mobileNumber: form.mobile,
      });
      // The backend creates the account; we now need to log the user in so
      // the verify-email page can call /auth/email/verify (which requires auth).
      try {
        await login({ identifier: form.email, password: form.password });
      } catch {
        // If auto-login fails, send the user to the login page with a hint.
        navigate('/login');
        return;
      }
      push(`Welcome, ${form.fullName.split(' ')[0]}! Check your inbox to verify your email.`, 'success');
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'http_400' && err.details && typeof err.details === 'object') {
          // Surface field errors from the backend.
          const fieldErrors: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.details as Record<string, unknown>)) {
            if (Array.isArray(v) && v.length) fieldErrors[k] = String(v[0]);
            else if (typeof v === 'string') fieldErrors[k] = v;
          }
          setErrors(fieldErrors);
          return;
        }
        push(err.message, 'error');
      } else {
        push('Could not create your account. Please try again.', 'error');
      }
    }
  };

  return (
    <AuthShell
      title="Microwork"
      subtitle="Sign up as a creator — set up your profile to apply to brand campaigns."
      footer={<>Have an account? <Link to="/login" className="text-ember-600 hover:text-ember-700 font-semibold">Log in</Link></>}
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
        <FormField label="Mobile number" helper="For collaboration reminders" error={errors.mobile}>
          <Input
            type="tel"
            value={form.mobile}
            onChange={set('mobile')}
            placeholder="+15555550123"
            autoComplete="tel"
            inputMode="tel"
            invalid={!!errors.mobile}
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
