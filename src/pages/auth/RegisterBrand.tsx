import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { FormField, Input, Button } from '../../components/ui';
import { useState } from 'react';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';

export default function RegisterBrand() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Enter your name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      errs.username = '3-20 letters, numbers or underscores';;
    if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      login('brand');
      push(`Welcome, ${form.fullName.split(' ')[0]}!`, 'success');
      navigate('/brand/dashboard');
    }, 400);
  };

  return (
    <AuthShell
      title="Microwork"
      subtitle="Sign up as a brand — find the right creators and run real campaigns."
      footer={<>Have an account? <Link to="/login" className="text-brand-600 hover:underline">Log in</Link></>}
      variant="brand"
    >
      <form onSubmit={submit} noValidate>
        <FormField label="Your name" error={errors.fullName}>
          <Input
            value={form.fullName}
            onChange={set('fullName')}
            placeholder="Jamie Lee"
            autoComplete="name"
            autoCapitalize="words"
            autoCorrect="off"
            invalid={!!errors.fullName}
          />
        </FormField>
        <FormField label="Work email" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="team@brand.com"
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
            placeholder="northwind"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            invalid={!!errors.username}
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
          {loading ? 'Creating account…' : 'Create brand account'}
        </Button>
      </form>
    </AuthShell>
  );
}