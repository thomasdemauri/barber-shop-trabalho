import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Btn } from '../ui';
import { IconUser, IconScissors, IconBell, IconCreditCard, IconHelpCircle, IconLogOut, IconChevronRight } from '../ui/Icons';
import { C } from '../data/catalog';

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const items = [
    { Icon: IconUser, label: 'Dados Pessoais' },
    { Icon: IconScissors, label: 'Preferências de Corte' },
    { Icon: IconBell, label: 'Notificações' },
    { Icon: IconCreditCard, label: 'Formas de Pagamento' },
    { Icon: IconHelpCircle, label: 'Central de Ajuda' },
  ];

  return (
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
                  >
                    <item.Icon size={18} className="text-cream3 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <IconChevronRight size={16} className="text-cream3" />
                  </button>
                ))}
              </div>

              <div className="mt-2">
                <Btn variant="danger" onClick={() => { logout(); nav('/login'); }}>
                  <span className="flex items-center justify-center gap-2"><IconLogOut size={16} /> Sair da Conta</span>
                </Btn>
              </div>
            </div>
          </div>
        </div>
  );
}
