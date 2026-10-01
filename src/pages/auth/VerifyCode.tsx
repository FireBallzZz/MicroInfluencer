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

  // Auto-focus first input on mount
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

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

  // Paste handler: accept a 6-digit string pasted anywhere in the row
  const onPaste = (startIndex: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;
    e.preventDefault();
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      const idx = startIndex + i;
      if (idx < 6) next[idx] = pasted[i];
    }
    setDigits(next);
    const focusIdx = Math.min(startIndex + pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
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
      title="Microwork"
      subtitle={`Check your email — we sent a 6-digit code to ${email}.`}
      footer={<><Link to="/login" className="text-brand-600 hover:underline">Cancel</Link></>}
    >
      <form onSubmit={submit} noValidate>
        {/* Hidden field that helps mobile browsers auto-fill from SMS */}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={() => {}}
        />
        <div
          className="flex justify-between gap-1.5 sm:gap-2 mb-4"
          role="group"
          aria-label="6-digit verification code"
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onPaste={(e) => onPaste(i, e)}
              onKeyDown={(e) => onKey(i, e)}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              aria-label={`Digit ${i + 1} of 6`}
              aria-invalid={!!error}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold border border-ink-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          ))}
        </div>
        {error && <div className="error mb-3" role="alert">{error}</div>}
        <Button size="lg" className="w-full" type="submit">Verify code</Button>
        <div className="text-sm text-ink-600 mt-4 text-center">
          Didn't get a code?{' '}
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
