import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { errorMessage } from '../../api/client';
import { catalogApi } from '../../api/endpoints';
import type { Service, ServiceInput } from '../../api/types';
import { useCatalog } from '../../hooks/useCatalog';
import { CATEGORIES } from '../../lib/categories';
import { formatDuration, formatPrice } from '../../lib/format';
import { C } from '../../theme';
import { Btn } from '../../ui';
import { IconPlus, IconScissors } from '../../ui/Icons';
import { Section } from './Section';
import { FIELD_LABEL, SELECT_STYLE, SMALL_BUTTON } from './styles';

const EMPTY_SERVICE: ServiceInput = { name: '', description: '', icon: null, category: 'corte', price: 0, durationMinutes: 30 };

const inputClass = 'w-full rounded-xl px-3 py-2 font-sans text-sm outline-none';

function NumberField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) {
  return (
    <label className="flex-1">
      <span className={FIELD_LABEL}>{label}</span>
      <input type="number" min={0} step={step} value={value} aria-label={label}
        onChange={e => onChange(Number(e.target.value))} className={inputClass} style={SELECT_STYLE} />
    </label>
  );
}

type EditableFields = Pick<Service, 'price' | 'durationMinutes' | 'active'>;

function ServiceRow({ service, onSave }: { service: Service; onSave: (changes: Partial<Service>) => Promise<void> }) {
  // Only the edited fields; everything else shows the saved service.
  const [changes, setChanges] = useState<Partial<EditableFields>>({});
  const [saving, setSaving] = useState(false);
  const draft = { ...service, ...changes };
  const change = <K extends keyof EditableFields>(field: K, value: EditableFields[K]) =>
    setChanges(current => ({ ...current, [field]: value }));

  const dirty = (Object.keys(changes) as (keyof EditableFields)[]).some(key => changes[key] !== service[key]);
  const save = async () => {
    setSaving(true);
    await onSave(changes);
    setChanges({});
    setSaving(false);
  };

  return (
    <div className="rounded-xl px-4 py-3 flex flex-col gap-3" style={{ background: C.s3, border: `1px solid ${C.b1}`, opacity: draft.active ? 1 : 0.6 }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-sans text-sm font-semibold text-cream truncate">{service.name}</div>
          {service.description && <div className="font-sans text-[11px]" style={{ color: C.cream3 }}>{service.description}</div>}
        </div>
        <label className="flex items-center gap-2 font-sans text-[11px] text-cream3 shrink-0">
          <input type="checkbox" checked={draft.active} onChange={e => change('active', e.target.checked)} />
          Ativo
        </label>
      </div>
      <div className="flex items-end gap-3">
        <NumberField label={`Preço de ${service.name}`} value={draft.price} step={0.5} onChange={price => change('price', price)} />
        <NumberField label={`Duração de ${service.name}`} value={draft.durationMinutes} step={5} onChange={minutes => change('durationMinutes', minutes)} />
        <Btn onClick={save} loading={saving} disabled={!dirty} style={SMALL_BUTTON}>Salvar</Btn>
      </div>
    </div>
  );
}

function NewServiceForm({ onCreate }: { onCreate: (input: ServiceInput) => Promise<boolean> }) {
  const [draft, setDraft] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    if (await onCreate({ ...draft, description: draft.description?.trim() || null })) setDraft(EMPTY_SERVICE);
    setSaving(false);
  };

  return (
    <div className="mt-4 rounded-xl p-4 flex flex-col gap-3" style={{ border: `1px dashed ${C.b2}` }}>
      <span className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: C.gold }}>Novo serviço</span>
      <input placeholder="Nome" aria-label="Nome do novo serviço" value={draft.name}
        onChange={e => setDraft({ ...draft, name: e.target.value })} className={inputClass} style={SELECT_STYLE} />
      <input placeholder="Descrição" aria-label="Descrição do novo serviço" value={draft.description ?? ''}
        onChange={e => setDraft({ ...draft, description: e.target.value })} className={inputClass} style={SELECT_STYLE} />
      <div className="flex items-end gap-3">
        <label className="flex-1">
          <span className={FIELD_LABEL}>Categoria</span>
          <select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })} className={inputClass} style={SELECT_STYLE}>
            {CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </label>
        <NumberField label="Preço do novo serviço" value={draft.price} step={0.5} onChange={price => setDraft({ ...draft, price })} />
        <NumberField label="Duração do novo serviço" value={draft.durationMinutes} step={5} onChange={durationMinutes => setDraft({ ...draft, durationMinutes })} />
      </div>
      <Btn onClick={submit} loading={saving} disabled={draft.name.trim().length < 2} style={{ ...SMALL_BUTTON, alignSelf: 'flex-end' }}>
        <span className="flex items-center gap-1.5"><IconPlus size={14} /> Adicionar</span>
      </Btn>
    </div>
  );
}

/** Admins manage the catalog; other staff see it read-only. */
export function ServicesSection({ editable }: { editable: boolean }) {
  const catalog = useCatalog();
  const [allServices, setAllServices] = useState<Service[]>([]);

  const loadAll = useCallback(() => catalogApi.allServices().then(setAllServices).catch(() => setAllServices([])), []);
  useEffect(() => { if (editable) void loadAll(); }, [editable, loadAll]);

  const refresh = async () => {
    await Promise.all([loadAll(), catalog.reload()]);
  };

  const update = async (id: string, changes: Partial<Service>) => {
    try {
      await catalogApi.updateService(id, changes);
      await refresh();
      toast.success('Serviço atualizado!');
    } catch (error) {
      toast.error(errorMessage(error, 'Não foi possível atualizar o serviço.'));
    }
  };

  const create = async (input: ServiceInput) => {
    try {
      await catalogApi.createService(input);
      await refresh();
      toast.success('Serviço criado!');
      return true;
    } catch (error) {
      toast.error(errorMessage(error, 'Não foi possível criar o serviço.'));
      return false;
    }
  };

  return (
    <Section icon={<IconScissors size={18} className="text-gold" />} title="Serviços">
      <div className="flex flex-col gap-2">
        {editable
          ? allServices.map(service => <ServiceRow key={service.id} service={service} onSave={changes => update(service.id, changes)} />)
          : catalog.services.map(service => (
            <div key={service.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: C.s3, border: `1px solid ${C.b1}` }}>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-sm font-semibold text-cream">{service.name}</div>
                <div className="font-sans text-[11px]" style={{ color: C.cream3 }}>{formatPrice(service.price)}</div>
              </div>
              <span className="font-sans text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{ background: C.goldBg, color: C.gold2, border: `1px solid ${C.gold}28` }}>
                {formatDuration(service.durationMinutes)}
              </span>
            </div>
          ))}
      </div>
      {editable && <NewServiceForm onCreate={create} />}
    </Section>
  );
}
