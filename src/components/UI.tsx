import type { ReactNode } from 'react';
export function BackBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
      <button onClick={onBack} className="text-xl">←</button>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="w-6" />
    </div>
  );
}

export function BottomNav({ current, onNav }: { current: string; onNav: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around p-3">
      <button onClick={() => onNav('home')} className={`flex-1 text-center ${current === 'home' ? 'text-yellow-400' : 'text-gray-300'}`}>🏠</button>
      <button onClick={() => onNav('appointments')} className={`flex-1 text-center ${current === 'appointments' ? 'text-yellow-400' : 'text-gray-300'}`}>📅</button>
      <button onClick={() => onNav('profile')} className={`flex-1 text-center ${current === 'profile' ? 'text-yellow-400' : 'text-gray-300'}`}>👤</button>
    </div>
  );
}

export function Btn({ children, onClick, disabled, loading }: { children: ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 rounded bg-yellow-400 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '...' : children}
    </button>
  );
}

export function Inp({ label, value, onChange, type = 'text', placeholder, right }: { label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; right?: ReactNode }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm text-gray-300 mb-1">{label}</label>}
      <div className="flex items-center bg-gray-800 rounded p-3">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none"
        />
        {right}
      </div>
    </div>
  );
}
