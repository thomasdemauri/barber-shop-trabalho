import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Btn } from '../ui';
import {
  IconUser, IconScissors, IconBell, IconCreditCard,
  IconHelpCircle, IconLogOut, IconChevronRight,
} from '../ui/Icons';
import { C } from '../data/catalog';
import { api } from '../services/api';

// ─── tipos ───────────────────────────────────────────────────────────────────

type ModalType = 'dados' | 'corte' | 'notif' | 'pagamento' | 'ajuda' | null;

// ─── componente base de modal ─────────────────────────────────────────────────

function Modal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden"
        style={{ background: C.s1, border: `1px solid ${C.b2}`, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${C.b1}` }}>
          <h2 className="font-serif text-lg font-bold text-cream">{title}</h2>
          <button
            className="tap flex h-8 w-8 items-center justify-center rounded-full font-sans text-lg font-bold transition-colors"
            style={{ background: C.s3, color: C.cream3 }}
            onClick={onClose}
          >×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── campo de formulário ──────────────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: C.gold }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none transition-all"
        style={{
          background: C.s2,
          border: `1px solid ${C.b2}`,
          color: C.cream,
        }}
      />
    </div>
  );
}

// ─── toggle switch ────────────────────────────────────────────────────────────

function Toggle({ label, sub, value, onChange }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${C.b1}` }}>
      <div>
        <p className="font-sans text-sm font-semibold text-cream">{label}</p>
        {sub && <p className="font-sans text-xs mt-0.5" style={{ color: C.cream3 }}>{sub}</p>}
      </div>
      <button
        className="relative shrink-0 h-6 w-11 rounded-full transition-all duration-200"
        style={{ background: value ? C.gold : C.s4, border: `1px solid ${value ? C.gold : C.b2}` }}
        onClick={() => onChange(!value)}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200"
          style={{ background: value ? '#0b0907' : C.cream3, left: value ? '22px' : '2px' }}
        />
      </button>
    </div>
  );
}

// ─── 1. Dados Pessoais ────────────────────────────────────────────────────────

function ModalDados({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConf, setSenhaConf] = useState('');

  const handleSave = async () => {
    if (!nome.trim()) { toast.error('Nome não pode ser vazio.'); return; }
    if (senhaNova && senhaNova !== senhaConf) { toast.error('As senhas não coincidem.'); return; }
    if (senhaNova && senhaNova.length < 6) { toast.error('Senha deve ter ao menos 6 caracteres.'); return; }

    try {
      await api('/profile', { method: 'PATCH', body: JSON.stringify({ name: nome, email, phone: telefone, ...(senhaNova ? { currentPassword: senhaAtual, password: senhaNova } : {}) }) });
      toast.success('Dados atualizados com sucesso!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar os dados.');
    }
  };

  return (
    <Modal title="Dados Pessoais" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Nome completo" value={nome} onChange={setNome} placeholder="Seu nome" />
        <Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="seu@email.com" />
        <Field label="Telefone" value={telefone} onChange={setTelefone} type="tel" placeholder="(11) 99999-9999" />

        <div className="mt-2 pt-4" style={{ borderTop: `1px solid ${C.b1}` }}>
          <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.gold }}>
            Alterar Senha
          </p>
          <div className="flex flex-col gap-3">
            <Field label="Senha atual" value={senhaAtual} onChange={setSenhaAtual} type="password" placeholder="••••••••" />
            <Field label="Nova senha" value={senhaNova} onChange={setSenhaNova} type="password" placeholder="••••••••" />
            <Field label="Confirmar nova senha" value={senhaConf} onChange={setSenhaConf} type="password" placeholder="••••••••" />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Btn onClick={handleSave} style={{ height: 52, background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}>
            Salvar alterações
          </Btn>
          <Btn variant="secondary" onClick={onClose} style={{ height: 52 }}>Cancelar</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── 2. Preferências de Corte ─────────────────────────────────────────────────

const ESTILOS = ['Degradê', 'Clássico', 'Moderno', 'Undercut', 'Buzz Cut', 'Pompadour'];
const BARBA_OPTS = ['Curta', 'Média', 'Longa', 'Sem barba'];

function ModalCorte({ onClose }: { onClose: () => void }) {
  const PREF_KEY = 'barbershop_prefs_corte';
  const saved = (() => { try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch { return {}; } })();

  const [estilo, setEstilo] = useState<string>(saved.estilo || '');
  const [barba, setBarba] = useState<string>(saved.barba || '');
  const [obs, setObs] = useState<string>(saved.obs || '');

  const handleSave = async () => {
    try {
      await api('/profile/preferences', { method: 'PATCH', body: JSON.stringify({ haircutPreferences: { estilo, barba, obs } }) });
      localStorage.setItem(PREF_KEY, JSON.stringify({ estilo, barba, obs }));
      toast.success('Preferências salvas!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar as preferências.');
    }
  };

  return (
    <Modal title="Preferências de Corte" onClose={onClose}>
      <div className="flex flex-col gap-5">

        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.gold }}>Estilo preferido</p>
          <div className="grid grid-cols-2 gap-2">
            {ESTILOS.map(e => (
              <button
                key={e}
                className="tap rounded-xl py-2.5 px-3 font-sans text-sm font-semibold transition-all text-left"
                style={{
                  background: estilo === e ? C.goldBg : C.s2,
                  border: `1px solid ${estilo === e ? C.gold : C.b2}`,
                  color: estilo === e ? C.gold2 : C.cream,
                }}
                onClick={() => setEstilo(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.gold }}>Barba</p>
          <div className="grid grid-cols-2 gap-2">
            {BARBA_OPTS.map(b => (
              <button
                key={b}
                className="tap rounded-xl py-2.5 px-3 font-sans text-sm font-semibold transition-all text-left"
                style={{
                  background: barba === b ? C.goldBg : C.s2,
                  border: `1px solid ${barba === b ? C.gold : C.b2}`,
                  color: barba === b ? C.gold2 : C.cream,
                }}
                onClick={() => setBarba(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: C.gold }}>
            Observações para o barbeiro
          </label>
          <textarea
            value={obs}
            onChange={e => setObs(e.target.value)}
            placeholder="Ex: não gosto de máquina nas laterais, prefiro tesoura..."
            rows={3}
            className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none resize-none"
            style={{ background: C.s2, border: `1px solid ${C.b2}`, color: C.cream }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Btn onClick={handleSave} style={{ height: 52, background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}>
            Salvar preferências
          </Btn>
          <Btn variant="secondary" onClick={onClose} style={{ height: 52 }}>Cancelar</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── 3. Notificações ──────────────────────────────────────────────────────────

function ModalNotif({ onClose }: { onClose: () => void }) {
  const NOTIF_KEY = 'barbershop_notif';
  const saved = (() => { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}'); } catch { return {}; } })();

  const [confirmacao, setConfirmacao] = useState(saved.confirmacao ?? true);
  const [lembrete, setLembrete] = useState(saved.lembrete ?? true);
  const [promocoes, setPromocoes] = useState(saved.promocoes ?? false);
  const [cancelamento, setCancelamento] = useState(saved.cancelamento ?? true);
  const [novidades, setNovidades] = useState(saved.novidades ?? false);

  const handleSave = async () => {
    try {
      await api('/profile/preferences', { method: 'PATCH', body: JSON.stringify({ notificationPreferences: { confirmacao, lembrete, promocoes, cancelamento, novidades } }) });
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ confirmacao, lembrete, promocoes, cancelamento, novidades }));
      toast.success('Preferências de notificação salvas!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar as notificações.');
    }
  };

  return (
    <Modal title="Notificações" onClose={onClose}>
      <div className="flex flex-col gap-1">
        <Toggle label="Confirmação de agendamento" sub="Quando um barbeiro confirmar seu horário" value={confirmacao} onChange={setConfirmacao} />
        <Toggle label="Lembrete de agendamento" sub="1 hora antes do seu horário" value={lembrete} onChange={setLembrete} />
        <Toggle label="Cancelamento" sub="Quando um agendamento for cancelado" value={cancelamento} onChange={setCancelamento} />
        <Toggle label="Promoções e descontos" sub="Ofertas especiais da barbearia" value={promocoes} onChange={setPromocoes} />
        <Toggle label="Novidades" sub="Novos serviços e atualizações" value={novidades} onChange={setNovidades} />
      </div>
      <div className="flex flex-col gap-2 mt-5">
        <Btn onClick={handleSave} style={{ height: 52, background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}>
          Salvar preferências
        </Btn>
        <Btn variant="secondary" onClick={onClose} style={{ height: 52 }}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

// ─── 4. Formas de Pagamento ───────────────────────────────────────────────────

const METODOS = [
  { id: 'dinheiro', icon: '💵', label: 'Dinheiro', sub: 'Pagamento no local' },
  { id: 'pix', icon: '⚡', label: 'Pix', sub: 'Transferência instantânea' },
  { id: 'debito', icon: '💳', label: 'Cartão de Débito', sub: 'Visa, Mastercard, Elo' },
  { id: 'credito', icon: '💳', label: 'Cartão de Crédito', sub: 'Até 3x sem juros' },
];

function ModalPagamento({ onClose }: { onClose: () => void }) {
  const PAG_KEY = 'barbershop_pagamento';
  const saved = (() => { try { return JSON.parse(localStorage.getItem(PAG_KEY) || '{}'); } catch { return {}; } })();

  const [preferido, setPreferido] = useState<string>(saved.preferido || '');
  const [pixChave, setPixChave] = useState<string>(saved.pixChave || '');

  const handleSave = async () => {
    try {
      await api('/profile/preferences', { method: 'PATCH', body: JSON.stringify({ paymentPreferences: { preferido, pixChave } }) });
      localStorage.setItem(PAG_KEY, JSON.stringify({ preferido, pixChave }));
      toast.success('Forma de pagamento salva!');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o pagamento.');
    }
  };

  return (
    <Modal title="Formas de Pagamento" onClose={onClose}>
      <div className="flex flex-col gap-5">

        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.gold }}>
            Método preferido
          </p>
          <div className="flex flex-col gap-2">
            {METODOS.map(m => (
              <button
                key={m.id}
                className="tap flex items-center gap-3 rounded-xl px-4 py-3 transition-all text-left"
                style={{
                  background: preferido === m.id ? C.goldBg : C.s2,
                  border: `1px solid ${preferido === m.id ? C.gold : C.b2}`,
                }}
                onClick={() => setPreferido(m.id)}
              >
                <span className="text-xl shrink-0">{m.icon}</span>
                <div className="flex-1">
                  <p className="font-sans text-sm font-semibold" style={{ color: preferido === m.id ? C.gold2 : C.cream }}>{m.label}</p>
                  <p className="font-sans text-xs" style={{ color: C.cream3 }}>{m.sub}</p>
                </div>
                {preferido === m.id && (
                  <span className="font-sans text-xs font-bold shrink-0" style={{ color: C.gold }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {preferido === 'pix' && (
          <Field label="Sua chave Pix (opcional)" value={pixChave} onChange={setPixChave} placeholder="CPF, e-mail ou telefone" />
        )}

        <div
          className="rounded-xl px-4 py-3 font-sans text-xs"
          style={{ background: C.goldBg, border: `1px solid ${C.gold}28`, color: C.cream3 }}
        >
          💡 O pagamento é sempre realizado presencialmente na barbearia. Esta configuração é apenas uma preferência para facilitar o atendimento.
        </div>

        <div className="flex flex-col gap-2">
          <Btn onClick={handleSave} style={{ height: 52, background: `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`, color: '#0b0907' }}>
            Salvar preferência
          </Btn>
          <Btn variant="secondary" onClick={onClose} style={{ height: 52 }}>Cancelar</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── 5. Central de Ajuda ──────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Como faço um agendamento?',
    a: 'Acesse "Serviços" no menu, escolha o serviço desejado, selecione o barbeiro, data e horário, e confirme.',
  },
  {
    q: 'Posso cancelar meu agendamento?',
    a: 'Sim! Em "Meus Agendamentos", clique no ✕ ao lado do agendamento. O cancelamento é gratuito até 2h antes.',
  },
  {
    q: 'Como edito meu agendamento?',
    a: 'Em "Meus Agendamentos", toque sobre o card do agendamento para editar data, horário ou serviço.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Aceitamos dinheiro, Pix e cartões de débito e crédito (até 3x sem juros). O pagamento é feito no local.',
  },
  {
    q: 'Como altero minha senha?',
    a: 'Acesse Perfil > Dados Pessoais e preencha os campos de alteração de senha.',
  },
  {
    q: 'Horários de funcionamento?',
    a: 'Segunda a Sexta: 9h às 18h. Sábados: 9h às 17h. Domingos e feriados: fechado.',
  },
];

function ModalAjuda({ onClose }: { onClose: () => void }) {
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <Modal title="Central de Ajuda" onClose={onClose}>
      <div className="flex flex-col gap-1 mb-5">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${C.b2}`, marginBottom: 6 }}
          >
            <button
              className="tap w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
              style={{ background: aberto === i ? C.s3 : C.s2 }}
              onClick={() => setAberto(aberto === i ? null : i)}
            >
              <span className="font-sans text-sm font-semibold text-cream pr-2">{faq.q}</span>
              <span
                className="font-sans text-base shrink-0 transition-transform duration-200"
                style={{ color: C.gold, transform: aberto === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >+</span>
            </button>
            {aberto === i && (
              <div className="px-4 py-3" style={{ background: C.s2, borderTop: `1px solid ${C.b1}` }}>
                <p className="font-sans text-sm leading-relaxed" style={{ color: C.cream3 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="rounded-xl px-4 py-4 text-center"
        style={{ background: C.s2, border: `1px solid ${C.b2}` }}
      >
        <p className="font-sans text-sm font-semibold text-cream mb-1">Ainda tem dúvidas?</p>
        <p className="font-sans text-xs mb-3" style={{ color: C.cream3 }}>Entre em contato pelo WhatsApp</p>
        <a
          href="https://wa.me/5516991616872"
          target="_blank"
          rel="noopener noreferrer"
          className="tap inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans text-sm font-bold transition-all"
          style={{ background: '#25d366', color: '#fff' }}
        >
          📱 Falar no WhatsApp
        </a>
      </div>
    </Modal>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [modal, setModal] = useState<ModalType>(null);

  const items: { Icon: React.FC<any>; label: string; modal: ModalType }[] = [
    { Icon: IconUser,        label: 'Dados Pessoais',        modal: 'dados' },
    { Icon: IconScissors,    label: 'Preferências de Corte', modal: 'corte' },
    { Icon: IconBell,        label: 'Notificações',          modal: 'notif' },
    { Icon: IconCreditCard,  label: 'Formas de Pagamento',   modal: 'pagamento' },
    { Icon: IconHelpCircle,  label: 'Central de Ajuda',      modal: 'ajuda' },
  ];

  return (
    <>
      {modal === 'dados'     && <ModalDados     onClose={() => setModal(null)} />}
      {modal === 'corte'     && <ModalCorte     onClose={() => setModal(null)} />}
      {modal === 'notif'     && <ModalNotif     onClose={() => setModal(null)} />}
      {modal === 'pagamento' && <ModalPagamento onClose={() => setModal(null)} />}
      {modal === 'ajuda'     && <ModalAjuda     onClose={() => setModal(null)} />}

      <div className="w-full max-w-8xl mx-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <h1 className="mb-6 sm:mb-8 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-cream">Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

          {/* User card */}
          <div className="lg:col-span-1">
            <div
              className="flex flex-row lg:flex-col items-center lg:items-center gap-4 lg:gap-3 rounded-xl p-5 lg:p-8 lg:text-center"
              style={{ background: C.s2, border: `1px solid ${C.b2}` }}
            >
              <div
                className="flex h-16 w-16 lg:h-24 lg:w-24 shrink-0 items-center justify-center rounded-full"
                style={{ background: C.s3, border: `2px solid ${C.b2}` }}
              >
                <IconUser size={32} className="text-cream3 lg:hidden" />
                <IconUser size={48} className="text-cream3 hidden lg:block" />
              </div>
              <div className="min-w-0 lg:mt-2">
                <p className="mb-0.5 font-serif text-xl sm:text-2xl font-semibold text-cream truncate">
                  {user?.nome || 'João Silva'}
                </p>
                <p className="font-sans text-sm text-cream3 truncate">
                  {user?.email || 'joao.silva@email.com'}
                </p>
                {user?.telefone && (
                  <p className="font-sans text-xs text-cream3 mt-1 truncate">{user.telefone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Settings + Logout */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {items.map((item) => (
                <button
                  key={item.label}
                  className="tap flex w-full items-center gap-3 rounded-xl p-4 font-sans text-sm text-cream hover:bg-s3 transition-colors text-left"
                  style={{ background: C.s2, border: `1px solid ${C.b1}` }}
                  onClick={() => setModal(item.modal)}
                >
                  <item.Icon size={18} className="text-cream3 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <IconChevronRight size={16} className="text-cream3" />
                </button>
              ))}
            </div>

            <div className="mt-2">
              <Btn variant="danger" onClick={() => { logout(); nav('/login'); }}>
                <span className="flex items-center justify-center gap-2">
                  <IconLogOut size={16} /> Sair da Conta
                </span>
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}