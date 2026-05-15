import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Inp, Btn } from '../components/UI_New';

export default function Register(){
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [conf, setConf] = useState('');
  const auth = useAuth();
  const nav = useNavigate();

  const handle = () => {
    if(!nome||!email||!senha||senha!==conf){
      alert('Preencha os campos corretamente');
      return;
    }
    auth.register({ nome, email, telefone, senha });
    nav('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl mb-4">Criar Conta</h2>
        <div className="space-y-3">
          <Inp placeholder="Nome completo" value={nome} onChange={setNome} />
          <Inp placeholder="E-mail" value={email} onChange={setEmail} />
          <Inp placeholder="Telefone" value={telefone} onChange={setTelefone} />
          <Inp type="password" placeholder="Senha" value={senha} onChange={setSenha} />
          <Inp type="password" placeholder="Confirmar senha" value={conf} onChange={setConf} />
          <Btn onClick={handle}>Criar Conta</Btn>
        </div>
        <div className="text-center mt-4 text-sm text-gray-300">
          <button onClick={()=>nav('/login')} className="text-gray-300">Já tenho conta</button>
        </div>
      </div>
    </div>
  );
}
