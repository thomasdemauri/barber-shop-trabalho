import type { ReactNode } from 'react';

export function BackBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex h-14 sm:h-16 shrink-0 items-center gap-4 px-2 sm:px-0">
      <button
        className="tap flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-s3 border-none hover:bg-s4 transition-colors"
        onClick={onBack}
      >
        <span className="text-xl leading-none text-cream">‘Â…</span>
      </button>
      <span className="flex-1 font-sans text-lg sm:text-xl font-semibold text-cream text-center sm:text-left">
        {title}
      </span>
      <div className="flex min-w-10 justify-end">{right || null}</div>
    </div>
  );
}
