import { useState } from 'react';
import toast from 'react-hot-toast';
import { errorMessage } from '../../api/client';
import { useShop } from '../../hooks/useShop';
import { Btn, Inp } from '../../ui';
import { IconSave, IconScissors } from '../../ui/Icons';
import { Section } from './Section';
import { SMALL_BUTTON } from './styles';

export function ShopSettingsSection() {
  const { shopName, saveSettings } = useShop();
  // `null` until the admin types, so the field follows the saved name until then.
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const name = draft ?? shopName;

  const save = async () => {
    setSaving(true);
    try {
      await saveSettings({ name });
      setDraft(null);
      toast.success('Nome da barbearia salvo!');
    } catch (error) {
      toast.error(errorMessage(error, 'Não foi possível salvar.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section
      icon={<IconScissors size={18} className="text-gold" />}
      title="Barbearia"
      action={
        <Btn onClick={save} loading={saving} disabled={name.trim() === shopName} style={SMALL_BUTTON}>
          <span className="flex items-center gap-1.5"><IconSave size={14} /> Salvar</span>
        </Btn>
      }
    >
      <Inp label="Nome da barbearia" value={name} onChange={setDraft} />
    </Section>
  );
}
