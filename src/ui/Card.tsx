import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  style,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-[14px] border border-b2 bg-s2 ${onClick ? 'tap cursor-pointer' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
