import { useRef, useState } from 'react';
import clsx from 'clsx';
import { Camera, X, Link as LinkIcon, Upload, ImagePlus } from 'lucide-react';
import { Button, Input } from './ui';

type Variant = 'avatar' | 'cover';

/**
 * ImagePicker — changeable cover or avatar.
 *
 * Three ways to set the image:
 *   1. Drag a file into the dropzone (or click to upload).
 *   2. Paste a hosted image URL.
 *   3. Generate from the user's name (clear / remove).
 *
 * The file is read as a data URL and stored as-is so the demo runs entirely
 * in localStorage with no upload backend.
 *
 * The cover variant fills the full width; the avatar variant is a square
 * with a circular preview. Both have a clear hover affordance.
 */
export function ImagePicker({
  value,
  onChange,
  onClear,
  variant = 'cover',
  name,
  fallback,
  className,
  aspect = variant === 'cover' ? '16 / 5' : '1 / 1',
  helperText,
}: {
  value?: string;
  onChange: (url: string) => void;
  onClear: () => void;
  variant?: Variant;
  name: string;
  fallback?: React.ReactNode;
  className?: string;
  aspect?: string;
  helperText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('That file isn’t an image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image is over 2 MB. Try a smaller one.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const applyUrl = () => {
    setError(null);
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('data:image/')) {
      setError('URL must start with http(s)://');
      return;
    }
    onChange(url);
    setUrlDraft('');
    setShowUrl(false);
  };

  const isAvatar = variant === 'avatar';
  const hasImage = Boolean(value);

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Preview + dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        className={clsx(
          'relative w-full overflow-hidden border-2 transition-all duration-200',
          isAvatar ? 'rounded-full' : 'rounded-md',
          drag
            ? 'border-ember-500 bg-ember-50/40 scale-[1.01]'
            : hasImage
              ? 'border-ink-200 hover:border-ink-300'
              : 'border-dashed border-ink-200 bg-paper-100/50 hover:border-ink-300 hover:bg-paper-100',
        )}
        style={{ aspectRatio: aspect }}
      >
        {hasImage ? (
          <img
            src={value}
            alt={isAvatar ? `${name} avatar` : `${name} cover`}
            className={clsx(
              'w-full h-full object-cover',
              isAvatar ? '' : 'transition-transform duration-500 group-hover:scale-[1.02]',
            )}
            onError={() => {
              setError('Couldn’t load that image. Try another URL or upload.');
              onClear();
            }}
          />
        ) : (
          fallback || (
            <div className="w-full h-full flex flex-col items-center justify-center text-ink-400 text-center px-4">
              {isAvatar ? (
                <Camera className="w-6 h-6 mb-1.5" />
              ) : (
                <ImagePlus className="w-6 h-6 mb-1.5" />
              )}
              <div className="text-xs font-semibold">
                {drag ? 'Drop to upload' : isAvatar ? 'Add a profile photo' : 'Add a cover image'}
              </div>
              {!isAvatar && (
                <div className="text-[11px] mt-0.5 text-ink-400">
                  Recommended 1600 × 500 · JPG, PNG, or WebP
                </div>
              )}
            </div>
          )
        )}

        {/* Hover actions */}
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center gap-2 transition-opacity',
            hasImage
              ? 'opacity-0 hover:opacity-100 bg-ink-900/40'
              : 'opacity-100',
          )}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-semibold transition-colors',
              hasImage
                ? 'bg-paper-50 text-ink-900 hover:bg-paper-100'
                : 'bg-ink-900 text-paper-50 hover:bg-ink-700',
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            {hasImage ? 'Replace' : 'Upload'}
          </button>
          {hasImage && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-semibold
                         bg-paper-50 text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = ''; // allow re-upload of the same file
          }}
        />
      </div>

      {/* URL input row */}
      <div className="flex items-center gap-2">
        {!showUrl ? (
          <button
            type="button"
            onClick={() => setShowUrl(true)}
            className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 font-medium transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Or paste an image URL
          </button>
        ) : (
          <div className="flex-1 flex items-center gap-2 anim-fade-in">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://…/photo.jpg"
              className="flex-1 h-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyUrl();
                }
              }}
            />
            <Button type="button" size="sm" onClick={applyUrl}>Apply</Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setShowUrl(false); setUrlDraft(''); }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-sm px-3 py-2">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div className="text-xs text-ink-500">{helperText}</div>
      )}
    </div>
  );
}
