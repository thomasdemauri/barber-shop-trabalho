import type { ReactNode } from 'react';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// STATUS BAR
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function StatusBar() {
  return (
    <div className="bg-dark-bg border-b border-border px-4 py-2 flex justify-between items-center text-xs text-text-tertiary">
      <span>9:41</span>
      <div className="flex gap-1">ðŸ“¶ ðŸ“¡ ðŸ”‹</div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// BACK BAR (Header com voltar)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function BackBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-dark-bg border-b border-border px-4 py-3 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-border transition-colors text-2xl leading-none"
      >
        â€¹
      </button>
      <h2 className="text-heading text-text-primary">{title}</h2>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PRIMARY BUTTON
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function Btn({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  size = 'lg'
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'lg';
}) {
  const baseClass = 'font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap';
  
  const variants = {
    primary: 'bg-gold text-dark-bg hover:bg-gold-light disabled:opacity-50',
    secondary: 'bg-dark-card border border-gold text-gold hover:bg-gold-light/10',
    ghost: 'text-gold hover:bg-gold-light/10'
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    lg: 'w-full py-3 px-4 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <span className="animate-spin">âŸ³</span>
          <span>Aguarde...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// INPUT FIELD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function Inp({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  right,
  autoFocus,
  error
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  right?: ReactNode;
  autoFocus?: boolean;
  error?: string;
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <div className="relative flex items-center bg-dark-input border border-border rounded-lg px-4 py-3 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/20">
        <input
          autoFocus={autoFocus}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-tertiary"
        />
        {right && <div className="ml-2 flex-shrink-0">{right}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// BOTTOM NAVIGATION
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function BottomNav({
  current,
  onNav
}: {
  current: string;
  onNav: (id: string) => void;
}) {
  const items = [
    { id: 'home', icon: 'ðŸ ', label: 'InÃ­cio' },
    { id: 'appointments', icon: 'ðŸ“…', label: 'Agendamentos' },
    { id: 'profile', icon: 'ðŸ‘¤', label: 'Perfil' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-border px-4 py-3 flex justify-around gap-2">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onNav(item.id)}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
            current === item.id
              ? 'text-gold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// BADGE (Status)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function Badge({ status }: { status: 'pending' | 'confirmed' | 'canceled' }) {
  const variants = {
    pending: 'badge-pending',
    confirmed: 'badge-success',
    canceled: 'badge-canceled'
  };

  const labels = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    canceled: 'Cancelado'
  };

  return (
    <span className={`badge ${variants[status]}`}>
      {labels[status]}
    </span>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CARD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function Card({
  children,
  onClick,
  hover = false
}: {
  children: ReactNode;
  onClick?: () => void;
  hover?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`card ${hover ? 'card-hover' : ''} p-4`}
    >
      {children}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// STARS (Rating)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-gold">
      {[...Array(5)].map((_, i) => (
        <span key={i}>{i < Math.floor(rating) ? 'â˜…' : 'â˜†'}</span>
      ))}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HOME INDICATOR (iPhone)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function HomeIndicator() {
  return (
    <div className="h-6 flex items-end justify-center pb-1">
      <div className="w-32 h-1 bg-text-primary rounded-full" />
    </div>
  );
}
