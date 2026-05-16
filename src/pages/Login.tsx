import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
      else toast.error('Credenciais inválidas');
    }, 1100);
  };

  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Brand Left Split — Desktop only */}
      <div className="hidden lg:flex w-[48%] flex-col justify-center items-center border-r border-b1 p-16 relative overflow-hidden" style={{ background: C.s1 }}>
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: `radial-gradient(circle, ${C.gold} 0%, transparent 70%)` }} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl" style={{ background: C.s3, border: `1px solid ${C.b2}` }}>
            <IconScissors size={40} className="text-gold" />
          </div>
          <h1 className="font-serif text-5xl font-bold text-cream text-center leading-tight">Navalha de Ouro</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ background: `${C.gold}40` }} />
            <p className="font-sans text-xs text-cream3 uppercase tracking-[0.3em]">Barbearia Clássica</p>
            <div className="w-8 h-px" style={{ background: `${C.gold}40` }} />
          </div>
        </div>
      </div>

      {/* Right / Full panel on mobile */}
      <div className="flex flex-1 flex-col bg-bg overflow-y-auto">

        {/* Form area — full height, logo + form centered together */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-0">
          <div className="w-full max-w-sm flex flex-col gap-5 animate-fade-up">

            {/* Mobile: brand block — inside the form flow, same background */}
            <div className="lg:hidden flex flex-col items-center text-center mb-2">
              <div
                className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
                style={{ background: C.s3, border: `1px solid ${C.b2}` }}
              >
                <IconScissors size={32} className="text-gold" />
              </div>
              <h2 className="font-serif text-[26px] font-bold text-cream leading-none">Navalha de Ouro</h2>
              <div className="flex items-center gap-3 mt-2.5">
                <div className="w-7 h-px" style={{ background: `${C.gold}40` }} />
                <p className="font-sans text-[9px] text-cream3 uppercase tracking-[0.35em]">Barbearia Clássica</p>
                <div className="w-7 h-px" style={{ background: `${C.gold}40` }} />
              </div>
            </div>

            <h3 className="font-serif text-2xl font-bold text-cream text-center lg:block">
              Acesse sua conta
            </h3>

            {/* Mode toggle */}
            <div className="flex rounded-xl p-1" style={{ background: C.s2 }}>
              {([['client', 'Cliente'], ['admin', 'Barbeiro']] as const).map(([m, lbl]) => (
                <button
                  key={m}
                  className="tap flex-1 rounded-lg py-3 font-sans text-sm font-semibold transition-all duration-200"
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

            <div className="flex flex-col gap-1">
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
              <div className="flex justify-end mt-1">
                <button
                  className="tap border-none bg-transparent font-sans text-[12px] font-medium text-gold2 hover:text-gold transition-colors"
                  onClick={() => nav('/forgot')}
                >
                  Esqueci a senha
                </button>
              </div>
            </div>

            <Btn onClick={handleLogin} loading={loading} style={{ height: 50 }}>
              {loading ? '' : 'Entrar'}
            </Btn>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: C.b1 }} />
              <span className="font-sans text-[11px] text-cream3 uppercase tracking-wider">ou</span>
              <div className="flex-1 h-px" style={{ background: C.b1 }} />
            </div>

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
    </div>
  );
}
