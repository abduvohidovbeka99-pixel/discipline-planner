import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface Props {
  className?: string;
  /** Label before arming. */
  children: ReactNode;
  /** Label when armed (second tap confirms). */
  confirm: ReactNode;
  onConfirm(): void;
  title?: string;
  style?: CSSProperties;
  /** Class added while armed (default "arm"). */
  armClass?: string;
}

/**
 * Two-step destructive button: first tap arms it, second tap confirms.
 * Tapping anywhere else disarms it (as in the prototype).
 */
export function ConfirmButton({ className = '', children, confirm, onConfirm, title, style, armClass = 'arm' }: Props) {
  const [armed, setArmed] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!armed) return;
    const off = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setArmed(false);
    };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [armed]);

  return (
    <button
      ref={ref}
      type="button"
      title={title}
      style={style}
      className={className + (armed && armClass ? ' ' + armClass : '')}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      {armed ? confirm : children}
    </button>
  );
}
