import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { errorMessage } from '../api/client';
import { authApi } from '../api/endpoints';
import { AuthBrandPanel } from '../components/AuthBrandPanel';
import { C } from '../theme';
import { Btn, Inp } from '../ui';
import { IconCheck } from '../ui/Icons';

const MIN_PASSWORD_LENGTH = 6;

/** Target of the link sent by e-mail: /reset-password?token=… */
export default function ResetPassword() {
  const nav = useNavigate();
  const token = useSearchParams()[0].get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const problem = !token
    ? 'Link de recuperação inválido.'
    : password.length > 0 && password.length < MIN_PASSWORD_LENGTH
      ? `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`
      : confirmation.length > 0 && confirmation !== password
        ? 'As senhas não coincidem.'
        : null;
  const canSubmit = !problem && password.length >= MIN_PASSWORD_LENGTH && confirmation === password;

  const submit = async () => {
    setSaving(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (error) {
      toast.error(errorMessage(error, 'Não foi possível redefinir a senha.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-bg">
      <AuthBrandPanel />
      <div className="flex flex-1 flex-col justify-center items-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 bg-bg overflow-y-auto">
        <div className="w-full max-w-sm flex flex-col animate-fade-up">
          {done ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: C.greenBg, border: `1px solid ${C.green}44` }}>
                <IconCheck size={28} className="text-green" />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold text-cream text-center">Senha redefinida</h3>
              <p className="mb-10 font-sans text-sm text-cream3 text-center">Agora você já pode entrar com a nova senha.</p>
              <Btn onClick={() => nav('/login')}>Ir para o login</Btn>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h3 className="mb-2 font-serif text-2xl font-bold text-cream text-center">Nova senha</h3>
              <Inp label="Nova senha" type="password" value={password} onChange={setPassword} autoFocus />
              <Inp label="Confirmar nova senha" type="password" value={confirmation} onChange={setConfirmation} />
              {problem && <p className="font-sans text-xs" style={{ color: C.red }}>{problem}</p>}
              <div className="mt-6">
                <Btn onClick={submit} loading={saving} disabled={!canSubmit}>Redefinir senha</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
