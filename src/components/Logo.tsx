import { Link } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Brand mark for Microwork.
 *
 * We no longer ship a raster logo — the wordmark *is* the brand. This is
 * intentional: the type is set in Fraunces (variable serif) with a custom
 * ligature and a small editorial dot, so it reads as a single designed
 * piece rather than a stack of "icon + label". It also keeps the
 * experience crisp at every zoom level with no JPEG artifacts.
 *
 * Variants:
 *   • `default` — for warm paper surfaces (most of the app)
 *   • `invert`  — for dark surfaces (auth panel, footer)
 */
export function Wordmark({
  to = '/',
  onClick,
  size = 'md',
  variant = 'default',
  ariaLabel = 'Microwork home',
  className,
}: {
  to?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'invert';
  ariaLabel?: string;
  className?: string;
}) {
  const dims = SIZE_MAP[size];
  const palette = variant === 'invert' ? INVERT : DEFAULT;

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={ariaLabel}
      className={clsx(
        'group inline-flex items-center gap-2 focus:outline-none',
        className,
      )}
    >
      <Mark size={size} variant={variant} />
      <span
        className={clsx(
          'font-display leading-none tracking-[-0.035em] select-none',
          palette.text,
          dims.wordmark,
        )}
        style={{ fontVariationSettings: "'opsz' 100, 'SOFT' 50" }}
      >
        Micro<span className={clsx('italic font-medium', palette.accent)}>·</span>work
      </span>
    </Link>
  );
}

/**
 * Just the colored initial "M" — a square mini-mark for tight spots
 * (favicons, drawer header, button previews). Pure CSS, retina-clean.
 */
export function Mark({
  size = 'md',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'invert';
}) {
  const dims = SIZE_MAP[size];
  const palette = variant === 'invert' ? INVERT : DEFAULT;

  return (
    <span
      aria-hidden
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-sm',
        palette.markBg,
      )}
      style={{ width: dims.box, height: dims.box }}
    >
      <span
        className={clsx(
          'font-display italic font-medium leading-none',
          palette.markText,
        )}
        style={{ fontSize: dims.markText, letterSpacing: '-0.04em' }}
      >
        µ
      </span>
    </span>
  );
}

/* Default to Logo so the public API is the same after the rename.
   Existing imports of `Logo` and `LogoMark` keep working. */
export const Logo = Wordmark;
export const LogoMark = Mark;

const SIZE_MAP = {
  sm: { box: 22, wordmark: 'text-[16px]', markText: 14 },
  md: { box: 28, wordmark: 'text-[20px]', markText: 18 },
  lg: { box: 36, wordmark: 'text-[24px]', markText: 22 },
} as const;

const DEFAULT = {
  text: 'text-ink-900',
  accent: 'text-ember-600',
  markBg: 'bg-ink-900',
  markText: 'text-paper-50',
} as const;

const INVERT = {
  text: 'text-paper-50',
  accent: 'text-ember-400',
  markBg: 'bg-paper-50',
  markText: 'text-ink-900',
} as const;
