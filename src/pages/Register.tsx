import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BackBar, Inp, Btn } from '../ui';
import { C } from '../data/catalog';
import { maskPhone } from '../services/masks';
import { IconScissors, IconCheck } from '../ui/Icons';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [cpw, setCpw] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();
  const pwMatch = pw.length > 0 && cpw.length > 0 && pw === cpw;

  const handle = () => {
    if (!name || !email || !pwMatch) return;
    setLoading(true);
    setTimeout(() => {
      auth.register({ nome: name, email, telefone: phone, senha: pw });
      nav('/home');
    }, 1000);
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
      <div className="flex flex-1 flex-col justify-center items-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 bg-bg overflow-y-auto">

        <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-up">

          {/* Mobile back */}
          <div className="lg:hidden">
            <BackBar title="Criar Conta" onBack={() => nav('/login')} />
          </div>

          {/* Desktop back */}
          <div className="hidden lg:flex items-center">
            <button onClick={() => nav('/login')} className="tap text-gold2 hover:text-gold flex items-center gap-2 font-sans text-sm font-medium transition-colors">
              <span className="text-lg leading-none">←</span> Voltar ao Login
            </button>
          </div>

          <h3 className="font-serif text-2xl font-bold text-cream hidden lg:block text-center">
            Crie sua conta
          </h3>

          <Inp label="Nome Completo" value={name} onChange={setName} placeholder="Seu nome" autoFocus />
          <Inp label="E-mail" value={email} onChange={setEmail} type="email" placeholder="nome@email.com" />
          <Inp label="Telefone" value={phone} onChange={(v) => setPhone(maskPhone(v))} type="tel" placeholder="(11) 9 0000-0000" />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-b1" />
            <span className="font-sans text-[10px] text-cream3 uppercase tracking-widest">Segurança</span>
            <div className="flex-1 h-px bg-b1" />
          </div>

          <Inp label="Senha" value={pw} onChange={setPw} type="password" placeholder="Mínimo 8 caracteres" />
          <Inp label="Confirmar Senha" value={cpw} onChange={setCpw} type="password" placeholder="Repita a senha" />

          {pwMatch && (
            <div className="flex items-center gap-2 font-sans text-xs font-medium text-green animate-fade-up">
              <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: C.greenBg, border: `1px solid ${C.green}44` }}><IconCheck size={12} className="text-green" /></span>
              <span>Senhas coincidem</span>
            </div>
          )}

          <Btn onClick={handle} loading={loading} disabled={!name || !email || !pwMatch}>
            Finalizar Cadastro
          </Btn>

          {/* Mobile footer link */}
          <div className="text-center lg:hidden">
            <span className="font-sans text-[13px] text-cream3">Já tem conta? </span>
            <button
              className="tap border-none bg-transparent font-sans text-[13px] font-bold text-gold2 hover:text-gold transition-colors"
              onClick={() => nav('/login')}
            >
              Fazer login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
