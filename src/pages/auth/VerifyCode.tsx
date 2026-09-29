import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/AuthShell';
import { Button } from '../../components/ui';
import { useEffect, useRef, useState } from 'react';

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? 'your email';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    // Demo: accept any code
    navigate('/reset-password', { state: { resetToken: 'demo-token' } });
  };

  return (
    <AuthShell
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${email}. Enter it below to continue.`}
      footer={<><Link to="/login" className="text-brand-600 hover:underline">Cancel</Link></>}
    >
      <form onSubmit={submit}>
        <div className="flex justify-between gap-2 mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center text-2xl font-semibold border border-ink-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          ))}
        </div>
        {error && <div className="error mb-3">{error}</div>}
        <Button size="lg" className="w-full" type="submit">Verify code</Button>
        <div className="text-sm text-ink-600 mt-4 text-center">
          Didn’t get a code?{' '}
          {cooldown > 0 ? (
            <span className="text-ink-400">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={() => setCooldown(60)}
              className="text-brand-600 hover:underline"
            >
              Resend code
            </button>
          )}
        </div>
      </form>
    </AuthShell>
  );
}