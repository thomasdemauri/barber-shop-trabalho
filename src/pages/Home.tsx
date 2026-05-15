import { useAuth } from '../contexts/AuthContext';
import { Btn } from '../components/UI_New';

export default function Home(){
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-sm text-gray-300">Olá,</div>
            <div className="text-2xl font-serif">{user?.nome || 'Usuário'}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>alert('Notificações')} className="w-10 h-10 rounded-full bg-gray-700">🔔</button>
            <button onClick={logout} className="text-sm text-gray-300">Sair</button>
          </div>
        </div>

        <div className="bg-gray-800/60 rounded-xl p-4 mb-4">
          <h3 className="text-lg font-semibold">Próximo Agendamento</h3>
          <div className="mt-2 text-gray-300">Nenhum agendamento</div>
        </div>

        <Btn onClick={()=>window.location.href = '/services'}>✂ Agendar Agora</Btn>
      </div>
    </div>
  );
}
