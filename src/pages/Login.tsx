import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Inp, Btn } from '../components/UI_New';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mode, setMode] = useState<'client'|'admin'>('client');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();

  const handle = async () => {
    setLoading(true);
    setTimeout(() => {
      const ok = auth.login(email, senha, mode);
      setLoading(false);
      if (ok) nav(mode === 'admin' ? '/admin' : '/home');
      else alert('Credenciais inválidas');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl">✂</div>
          <h1 className="text-3xl font-serif">Navalha de Ouro</h1>
          <p className="text-sm text-gray-300">Barbearia Premium</p>
        </div>

        <div className="bg-gray-800/60 rounded-xl p-4 mb-4 flex gap-2">
          <button onClick={() => setMode('client')} className={`flex-1 py-2 rounded-lg ${mode==='client'?'bg-yellow-400 text-black':'text-gray-300'}`}>👤 Cliente</button>
          <button onClick={() => setMode('admin')} className={`flex-1 py-2 rounded-lg ${mode==='admin'?'bg-yellow-400 text-black':'text-gray-300'}`}>✂ Barbeiro</button>
        </div>

        <div className="space-y-3">
          <Inp placeholder="E-mail ou Telefone" value={email} onChange={setEmail} />
          <Inp type="password" placeholder="Senha" value={senha} onChange={setSenha} />
          <div className="text-right"><button className="text-sm text-gray-300">Esqueceu a senha?</button></div>
          <Btn onClick={handle} loading={loading}>{loading? 'Entrando...' : 'Entrar'}</Btn>
        </div>

        <div className="text-center mt-4 text-sm text-gray-300 bg-blue-500">
          Não tem conta? <button onClick={()=>nav('/register')} className="text-yellow-300 font-semibold">Cadastre-se</button>
        </div>
      </div>
    </div>
  );
}
