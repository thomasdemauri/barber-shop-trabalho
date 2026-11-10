import type { ReactNode, CSSProperties } from 'react';

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Btn({
  children,
  onClick,
  variant = 'primary',
  disabled,
  loading,
  style,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  const baseStyle: CSSProperties = {
    height: 46,
    borderRadius: 12,
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    ...style,
  };

  let bg = 'transparent';
  let color = 'var(--color-cream)';
  let border = '1px solid transparent';

  if (disabled) {
    bg = 'var(--color-s2)';
    color = 'var(--color-cream3)';
  } else if (isPrimary) {
    bg = 'var(--color-gold)';
    color = '#0b0907';
  } else if (isSecondary) {
    border = '1px solid var(--color-b2)';
  } else if (isDanger) {
    bg = 'var(--color-red-bg)';
    color = 'var(--color-red)';
    border = '1px solid var(--color-red)';
  }

  return (
    <button
      className={`tap flex w-full items-center justify-center ${className}`}
      onClick={disabled || loading ? undefined : onClick}
      style={{ ...baseStyle, background: bg, color, border }}
    >
      {loading ? (
        <span
          className="inline-block animate-spin"
          style={{
            width: 20,
            height: 20,
            border: `2px solid ${isPrimary ? 'rgba(0,0,0,0.2)' : 'var(--color-b2)'}`,
            borderTopColor: isPrimary ? '#0b0907' : 'var(--color-cream)',
            borderRadius: '50%',
          }}
        />
      ) : (
        children
      )}
    </button>
  );
}
