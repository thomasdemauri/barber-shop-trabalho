import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Inp, Btn } from '../ui';
import { C } from '../data/catalog';
import { IconScissors, IconEye, IconEyeOff } from '../ui/Icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [mode, setMode] = useState<'client' | 'admin'>('client');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const ok = auth.login(email, pw, mode);
      setLoading(false);
      if (ok) nav(mode === 'admin' ? '/admin' : '/home');
      else alert('Credenciais inválidas');
    }, 1100);
  };

  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Brand Left Split (Desktop) */}
      <div className="hidden lg:flex w-[48%] flex-col justify-center items-center border-r border-b1 p-16 relative overflow-hidden" style={{ background: C.s1 }}>
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: `radial-gradient(circle, ${C.gold} 0%, transparent 70%)` }} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl" style={{ background: C.s3, border: `1px solid ${C.b2}` }}>
            <IconScissors size={40} className="text-gold" />
          </div>
          <h1 className="font-serif text-5xl font-bold text-cream text-center leading-tight">Navalha de Ouro</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-gold/40" />
            <p className="font-sans text-xs text-cream3 uppercase tracking-[0.3em]">Barbearia Clássica</p>
            <div className="w-8 h-px bg-gold/40" />
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 bg-bg overflow-y-auto">

        {/* Mobile Header */}
        <div className="lg:hidden w-full text-center mb-16 animate-fade-up">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
            <IconScissors size={32} className="text-gold" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-cream mb-2">Navalha de Ouro</h2>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="w-6 h-px bg-gold/40" />
            <p className="font-sans text-[10px] tracking-[0.3em] text-cream3 uppercase">Barbearia Clássica</p>
            <div className="w-6 h-px bg-gold/40" />
          </div>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-up">

          <h3 className="font-serif text-2xl font-bold text-cream hidden lg:block text-center">
            Acesse sua conta
          </h3>

          {/* Mode toggle */}
          <div className="flex rounded-lg p-1" style={{ background: C.s2 }}>
            {([['client', 'Cliente'], ['admin', 'Barbeiro']] as const).map(([m, lbl]) => (
              <button
                key={m}
                className="tap flex-1 rounded-md py-3.5 font-sans text-sm font-semibold transition-colors"
                onClick={() => setMode(m)}
                style={{
                  background: mode === m ? C.gold : 'transparent',
                  color: mode === m ? '#0b0907' : C.cream3,
                }}
              >
                {lbl}
              </button>
            ))}
          </div>

          <Inp label="E-mail" value={email} onChange={setEmail} type="email" placeholder="nome@email.com" />

          <Inp
            label="Senha"
            value={pw}
            onChange={setPw}
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            right={
              <button
                className="tap border-none bg-transparent hover:text-gold transition-colors"
                style={{ color: C.cream3 }}
                onClick={() => setShowPw(p => !p)}
              >
                {showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            }
          />

          {/* Forgot link */}
          <div className="flex justify-end -mt-4">
            <button
              className="tap border-none bg-transparent font-sans text-[12px] font-medium text-gold2 hover:text-gold transition-colors"
              onClick={() => nav('/forgot')}
            >
              Esqueci a senha
            </button>
          </div>

          <Btn onClick={handleLogin} loading={loading}>
            {loading ? '' : 'Entrar'}
          </Btn>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-b1" />
            <span className="font-sans text-[11px] text-cream3 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-b1" />
          </div>

          {/* Register CTA */}
          <div className="text-center">
            <span className="font-sans text-[13px] text-cream3">Ainda não tem conta? </span>
            <button
              className="tap border-none bg-transparent font-sans text-[13px] font-bold text-gold2 hover:text-gold transition-colors"
              onClick={() => nav('/register')}
            >
              Criar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
