import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { C, SERVICES, BARBERS, TIME_SLOTS } from '../data/catalog';
import { IconSettings, IconScissors, IconUser, IconClock, IconSave, IconCheck } from '../ui/Icons';
import { Btn, Inp } from '../ui';

const CONFIG_KEY = 'barbershop_config';

type ShopConfig = {
  shopName: string;
  weekdays: number[];
  openTime: string;
  closeTime: string;
};

const DOW_FULL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function loadConfig(): ShopConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { shopName: 'Navalha de Ouro', weekdays: [1, 2, 3, 4, 5], openTime: '09:00', closeTime: '18:00' };
}

export default function AdminConfig() {
  const { user } = useAuth();
  const [cfg, setCfg] = useState<ShopConfig>(loadConfig);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) {
      const t = setTimeout(() => setDirty(false), 2000);
      return () => clearTimeout(t);
    }
  }, [dirty]);

  function update<K extends keyof ShopConfig>(key: K, value: ShopConfig[K]) {
    setCfg(prev => ({ ...prev, [key]: value }));
  }

  function save() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    toast.success('Configurações salvas!');
  }

  function toggleDay(d: number) {
    const next = cfg.weekdays.includes(d)
      ? cfg.weekdays.filter(w => w !== d)
      : [...cfg.weekdays, d].sort();
    update('weekdays', next);
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream flex items-center gap-3">
          <IconSettings size={24} className="text-gold" /> Configurações
        </h1>
        <Btn onClick={save} style={{ height: 40, fontSize: 13, padding: '0 20px', width: 'auto' }}>
          <span className="flex items-center gap-1.5">
            <IconSave size={14} /> Salvar
          </span>
        </Btn>
      </div>

      <div className="flex flex-col gap-6">
        {/* Barbearia */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
          <h2 className="font-serif text-lg font-bold text-cream mb-4 flex items-center gap-2">
            <IconScissors size={18} className="text-gold" /> Barbearia
          </h2>
          <Inp
            label="Nome da barbearia"
            value={cfg.shopName}
            onChange={v => update('shopName', v)}
          />
        </div>

        {/* Perfil */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
          <h2 className="font-serif text-lg font-bold text-cream mb-4 flex items-center gap-2">
            <IconUser size={18} className="text-gold" /> Seu Perfil
          </h2>
          <div className="rounded-xl p-4 font-sans text-sm space-y-2" style={{ background: C.s3, color: C.cream }}>
            <div className="flex items-center gap-2">
              <IconUser size={14} style={{ color: C.cream3 }} />
              <span>{user?.nome || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>
              {user?.email || '—'}
            </div>
            {user?.telefone && (
              <div className="flex items-center gap-2 text-xs" style={{ color: C.cream3 }}>
                {user.telefone}
              </div>
            )}
          </div>
        </div>

        {/* Horários */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
          <h2 className="font-serif text-lg font-bold text-cream mb-4 flex items-center gap-2">
            <IconClock size={18} className="text-gold" /> Horários de Funcionamento
          </h2>

          {/* Weekdays */}
          <div className="mb-5">
            <label className="mb-2 ml-1 block font-sans text-[11px] font-semibold uppercase tracking-wider text-cream3">
              Dias de funcionamento
            </label>
            <div className="flex gap-2">
              {DOW_FULL.map((name, i) => {
                const active = cfg.weekdays.includes(i);
                return (
                  <button key={i}
                    className="tap flex-1 rounded-xl py-2.5 font-sans text-[11px] font-semibold transition-all"
                    style={{
                      background: active ? C.gold : 'transparent',
                      color: active ? C.bg : C.cream2,
                      border: `1px solid ${active ? C.gold : C.b1}`,
                    }}
                    onClick={() => toggleDay(i)}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 ml-1 block font-sans text-[11px] font-semibold uppercase tracking-wider text-cream3">
                Abertura
              </label>
              <select value={cfg.openTime}
                onChange={e => update('openTime', e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 font-sans text-sm"
                style={{ background: C.s3, color: C.cream, border: `1px solid ${C.b1}` }}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 ml-1 block font-sans text-[11px] font-semibold uppercase tracking-wider text-cream3">
                Fechamento
              </label>
              <select value={cfg.closeTime}
                onChange={e => update('closeTime', e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 font-sans text-sm"
                style={{ background: C.s3, color: C.cream, border: `1px solid ${C.b1}` }}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
          <h2 className="font-serif text-lg font-bold text-cream mb-4 flex items-center gap-2">
            <IconScissors size={18} className="text-gold" /> Serviços
          </h2>
          <div className="flex flex-col gap-2">
            {SERVICES.map(svc => (
              <div key={svc.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: C.s3, border: `1px solid ${C.b1}` }}>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm font-semibold text-cream">{svc.name}</div>
                  <div className="font-sans text-[11px]" style={{ color: C.cream3 }}>
                    {svc.desc} · R$ {svc.price},00
                  </div>
                </div>
                <span className="font-sans text-[10px] font-semibold px-2 py-1 rounded-lg" 
                  style={{ background: `${C.goldBg}`, color: C.gold2, border: `1px solid ${C.gold}28` }}>
                  {svc.duration} min
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Barbeiros */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
          <h2 className="font-serif text-lg font-bold text-cream mb-4 flex items-center gap-2">
            <IconUser size={18} className="text-gold" /> Barbeiros
          </h2>
          <div className="flex flex-col gap-2">
            {BARBERS.map(barber => (
              <div key={barber.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: C.s3, border: `1px solid ${C.b1}` }}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold"
                  style={{ background: `${C.gold}20`, color: C.gold2 }}>
                  {barber.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm font-semibold text-cream">{barber.name}</div>
                  <div className="font-sans text-[11px]" style={{ color: C.cream3 }}>
                    {barber.specialty} · {barber.exp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
