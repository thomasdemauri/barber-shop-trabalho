import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Inp, Btn } from '../ui';
import { C } from '../data/catalog';
import { maskPhone } from '../services/masks';
import { IconScissors, IconCheck, IconX } from '../ui/Icons';

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

type Rule = { label: string; ok: boolean };
function PwRules({ pw }: { pw: string }) {
  const rules: Rule[] = [
    { label: 'Mínimo 8 caracteres', ok: pw.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(pw) },
    { label: 'Número', ok: /[0-9]/.test(pw) },
  ];
  if (!pw) return null;
  return (
    <div className="flex flex-col gap-1">
      {rules.map(r => (
        <div key={r.label} className="flex items-center gap-2 font-sans text-xs">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
            style={{ background: r.ok ? C.greenBg : C.redBg, border: `1px solid ${r.ok ? C.green : C.red}44` }}>
            {r.ok
              ? <IconCheck size={9} style={{ color: C.green }} />
              : <IconX size={9} style={{ color: C.red }} />}
          </span>
          <span style={{ color: r.ok ? C.green : C.cream3 }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [cpw, setCpw] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  const pwStrong = pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
  const pwMatch = pw.length > 0 && cpw.length > 0 && pw === cpw;
  const emailOk = validateEmail(email);

  const errors = {
    name:  !name.trim() ? 'Nome obrigatório' : '',
    email: !email ? 'E-mail obrigatório' : !emailOk ? 'E-mail inválido' : '',
    pw:    !pw ? 'Senha obrigatória' : !pwStrong ? 'Senha não atende os requisitos' : '',
    cpw:   !cpw ? 'Confirmação obrigatória' : !pwMatch ? 'Senhas não coincidem' : '',
  };

  const touch = (field: string) => setTouched(t => ({ ...t, [field]: true }));
  const canSubmit = !errors.name && !errors.email && !errors.pw && !errors.cpw;

  const handle = () => {
    setTouched({ name: true, email: true, pw: true, cpw: true });
    if (!canSubmit) { toast.error('Corrija os erros antes de continuar.'); return; }

    const users: any[] = JSON.parse(localStorage.getItem('barbershop_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      toast.error('Este e-mail já está cadastrado.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      auth.register({ nome: name.trim(), email, telefone: phone, senha: pw });
      toast.success('Cadastro realizado com sucesso!');
      nav('/home');
    }, 800);
  };

  return (
    <div className="flex min-h-screen w-full bg-bg">
      {/* Brand Left — Desktop */}
      <div className="hidden lg:flex w-[48%] flex-col justify-center items-center border-r border-b1 p-16 relative overflow-hidden" style={{ background: C.s1 }}>
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${C.gold} 0%, transparent 70%)` }} />
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

      {/* Right Panel */}
      <div className="flex flex-1 flex-col bg-bg overflow-y-auto">
        <div className="flex flex-1 flex-col items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-12">
          <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-up">

            {/* Mobile header */}
            <div className="lg:hidden flex items-center justify-between mb-1">
              <button onClick={() => nav('/login')} className="tap flex items-center gap-2 font-sans text-sm font-medium" style={{ color: C.gold2 }}>
                <span className="text-base leading-none">←</span><span>Voltar</span>
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.s2, border: `1px solid ${C.b2}` }}>
                <IconScissors size={18} className="text-gold" />
              </div>
            </div>

            <div className="lg:hidden flex flex-col items-center text-center mb-2">
              <h2 className="font-serif text-2xl font-bold text-cream leading-none">Navalha de Ouro</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-px" style={{ background: `${C.gold}40` }} />
                <p className="font-sans text-[9px] text-cream3 uppercase tracking-[0.35em]">Crie sua conta</p>
                <div className="w-6 h-px" style={{ background: `${C.gold}40` }} />
              </div>
            </div>

            <div className="hidden lg:flex items-center">
              <button onClick={() => nav('/login')} className="tap border-none bg-transparent flex items-center gap-2 font-sans text-sm font-medium" style={{ color: C.gold2 }}>
                <span className="text-lg leading-none">←</span> Voltar ao Login
              </button>
            </div>

            <h3 className="font-serif text-2xl font-bold text-cream hidden lg:block text-center">Crie sua conta</h3>

            {/* Campos */}
            <div className="flex flex-col gap-1">
              <Inp label="Nome Completo *" value={name} onChange={v => { setName(v); touch('name'); }} placeholder="Seu nome completo" autoFocus />
              {touched.name && errors.name && <p className="font-sans text-xs" style={{ color: C.red }}>{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Inp label="E-mail *" value={email} onChange={v => { setEmail(v); touch('email'); }} type="email" placeholder="nome@email.com" />
              {touched.email && errors.email && <p className="font-sans text-xs" style={{ color: C.red }}>{errors.email}</p>}
            </div>

            <Inp label="Telefone" value={phone} onChange={v => setPhone(maskPhone(v))} type="tel" placeholder="(11) 9 0000-0000" />

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px" style={{ background: C.b1 }} />
              <span className="font-sans text-[10px] text-cream3 uppercase tracking-widest">Segurança</span>
              <div className="flex-1 h-px" style={{ background: C.b1 }} />
            </div>

            <div className="flex flex-col gap-1">
              <Inp label="Senha *" value={pw} onChange={v => { setPw(v); touch('pw'); }} type="password" placeholder="Mínimo 8 caracteres" />
              <PwRules pw={pw} />
              {touched.pw && errors.pw && !pw && <p className="font-sans text-xs" style={{ color: C.red }}>{errors.pw}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Inp label="Confirmar Senha *" value={cpw} onChange={v => { setCpw(v); touch('cpw'); }} type="password" placeholder="Repita a senha" />
              {touched.cpw && errors.cpw && <p className="font-sans text-xs" style={{ color: C.red }}>{errors.cpw}</p>}
              {pwMatch && (
                <div className="flex items-center gap-2 font-sans text-xs font-medium" style={{ color: C.green }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: C.greenBg, border: `1px solid ${C.green}44` }}>
                    <IconCheck size={12} />
                  </span>
                  Senhas coincidem
                </div>
              )}
            </div>

            <Btn onClick={handle} loading={loading} style={{ height: 50 }}>
              Finalizar Cadastro
            </Btn>

            <div className="text-center lg:hidden">
              <span className="font-sans text-[13px] text-cream3">Já tem conta? </span>
              <button className="tap border-none bg-transparent font-sans text-[13px] font-bold text-gold2 hover:text-gold transition-colors" onClick={() => nav('/login')}>
                Fazer login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}