import { MyScheduleSection } from '../components/admin/MyScheduleSection';
import { Section } from '../components/admin/Section';
import { ServicesSection } from '../components/admin/ServicesSection';
import { ShopSettingsSection } from '../components/admin/ShopSettingsSection';
import { useAuth } from '../hooks/useAuth';
import { C } from '../theme';
import { IconSettings, IconUser } from '../ui/Icons';

export default function AdminConfig() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream flex items-center gap-3">
          <IconSettings size={24} className="text-gold" /> Configurações
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        {isAdmin && <ShopSettingsSection />}

        <Section icon={<IconUser size={18} className="text-gold" />} title="Seu Perfil">
          <div className="rounded-xl p-4 font-sans text-sm space-y-2" style={{ background: C.s3, color: C.cream }}>
            <div className="flex items-center gap-2">
              <IconUser size={14} style={{ color: C.cream3 }} />
              <span>{user?.nome}</span>
            </div>
            <div className="text-xs" style={{ color: C.cream3 }}>{user?.email}</div>
            {user?.telefone && <div className="text-xs" style={{ color: C.cream3 }}>{user.telefone}</div>}
          </div>
        </Section>

        <MyScheduleSection />
        <ServicesSection editable={isAdmin} />
      </div>
    </div>
  );
}
