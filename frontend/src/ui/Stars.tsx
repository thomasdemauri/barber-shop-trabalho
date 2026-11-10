import { IconStar } from './Icons';

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar
          key={i}
          size={size}
          style={{ color: i <= Math.round(rating) ? 'var(--color-gold2)' : 'var(--color-b2)' }}
        />
      ))}
    </div>
  );
}
