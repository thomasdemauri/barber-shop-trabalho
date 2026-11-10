import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackBar, Inp, Btn } from '../ui';
import { C } from '../data/catalog';
import { IconScissors, IconCheck } from '../ui/Icons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Brand Left Split (Desktop) */}
      <div className="hidden lg:flex w-[48%] flex-col justify-center items-center border-r border-b1 p-16 relative overflow-hidden" style={{ background: C.s1 }}>
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: `radial-gradient(circle, ${C.gold} 0%, transparent 70%)` }} />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-2xl" style={{ background: C.s3, border: `1px solid ${C.b2}` }}>
            <IconScissors size={40} className="text-gold" />
          </div>
          <h1 className="font-serif text-5xl font-bold text-cream mb-3 text-center leading-tight">
            Navalha de Ouro
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-8 h-px bg-gold/40" />
            <p className="font-sans text-xs text-cream3 uppercase tracking-[0.3em]">Sempre Portas Abertas</p>
            <div className="w-8 h-px bg-gold/40" />
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 bg-bg overflow-y-auto">
        <div className="w-full max-w-sm flex flex-col animate-fade-up">
          
          <div className="mb-8 lg:hidden">
            <BackBar title="Recuperar Senha" onBack={() => nav('/login')} />
          </div>

          <div className="hidden lg:flex mb-6 mt-2 items-center">
            <button onClick={() => nav('/login')} className="tap text-gold2 hover:text-gold flex items-center gap-2 font-sans text-sm font-medium transition-colors">
              <span className="text-lg leading-none">←</span> Voltar ao Login
            </button>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-10 animate-fade-up">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: C.greenBg, border: `1px solid ${C.green}44` }}>
                <IconCheck size={28} className="text-green" />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold text-cream text-center">Link Enviado</h3>
              <p className="mb-10 font-sans text-sm text-cream3 text-center leading-relaxed px-4">
                Enviamos as instruções de recuperação para o seu e-mail. Verifique a caixa de spam.
              </p>
              <Btn onClick={() => nav('/login')} variant="secondary">Voltar ao Login</Btn>
            </div>
          ) : (
            <div className="flex flex-col animate-fade-up">
              <h3 className="mb-4 font-serif text-2xl font-bold text-cream hidden lg:block text-center">
                Esqueceu a senha?
              </h3>
              <p className="mb-10 font-sans text-sm text-cream3 text-center leading-relaxed">
                Digite seu e-mail abaixo e enviaremos um link seguro para você redefinir sua senha.
              </p>
              
              <Inp label="E-mail" value={email} onChange={setEmail} type="email" placeholder="nome@email.com" autoFocus />
              
              <div className="mt-10">
                <Btn onClick={() => setSent(true)} disabled={!email}>Enviar Link</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
