import type { ReactNode } from 'react';
import { C } from '../data/catalog';

export function Inp({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  right,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  right?: ReactNode;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col w-full">
      {label && <label className="mb-1.5 ml-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-cream3">{label}</label>}
      <div
        className="relative flex h-10 sm:h-11 w-full items-center rounded-lg px-4 transition-all focus-within:border-gold"
        style={{ background: C.s2, border: `1px solid ${C.b1}` }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-full w-full border-none bg-transparent font-sans text-sm sm:text-base text-cream outline-none placeholder:text-cream3/50"
          style={{ paddingLeft: '8px' }}
        />
        {right && <div className="absolute right-4">{right}</div>}
      </div>
    </div>
  );
}
