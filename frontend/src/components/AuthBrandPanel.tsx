import { useShop } from '../hooks/useShop';
import { C } from '../theme';
import { IconScissors } from '../ui/Icons';

/** Desktop-only brand panel shown beside the account recovery forms. */
export function AuthBrandPanel() {
  const { shopName } = useShop();
  return (
    <div className="hidden lg:flex w-[48%] flex-col justify-center items-center border-r border-b1 p-16 relative overflow-hidden" style={{ background: C.s1 }}>
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: `radial-gradient(circle, ${C.gold} 0%, transparent 70%)` }} />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-2xl" style={{ background: C.s3, border: `1px solid ${C.b2}` }}>
          <IconScissors size={40} className="text-gold" />
        </div>
        <h1 className="font-serif text-5xl font-bold text-cream mb-3 text-center leading-tight">
          {shopName}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-8 h-px bg-gold/40" />
          <p className="font-sans text-xs text-cream3 uppercase tracking-[0.3em]">Sempre Portas Abertas</p>
          <div className="w-8 h-px bg-gold/40" />
        </div>
      </div>
    </div>
  );
}
