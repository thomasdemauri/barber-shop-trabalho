import { useAppointments } from '../contexts/AppointmentContext';
import { useAuth } from '../contexts/AuthContext';
import { SERVICES } from '../data/catalog';
import { useState } from 'react';
import { Btn, Badge } from '../components/UI_New';

export default function AdminDashboard(){
  const { appointments } = useAppointments();
  const { logout } = useAuth();
  const [filter, setFilter] = useState<string>('all'); // all, today, pending

  const today = new Date().toISOString().split('T')[0];

  let filtered = appointments.filter(a => a.status !== 'canceled');
  if (filter === 'today') filtered = filtered.filter(a => a.data_hora.startsWith(today));
  if (filter === 'pending') filtered = filtered.filter(a => a.status === 'pending');

  const getSvc = (id: string) => SERVICES.find(s => s.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-serif">Painel do Barbeiro</h1>
          <button onClick={logout} className="text-sm bg-gray-700 px-3 py-1 rounded">Sair</button>
        </div>

        <div className="flex gap-2 mb-4">
          {[['all','Todos'],['today','Hoje'],['pending','Pendentes']].map(([f,l]) => (
            <Btn key={f} onClick={()=>setFilter(f)} variant={filter===f? 'primary' : 'secondary'} size="sm">{l}</Btn>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && <div className="text-gray-300">Nenhum agendamento</div>}
          {filtered.map(a => {
            const svc = getSvc(a.servico_id);
            const dt = new Date(a.data_hora);
            return (
              <div key={a.id} className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">{svc?.name || 'Serviço'}</div>
                    <div className="text-sm text-gray-300">{dt.toLocaleString('pt-BR')}</div>
                  </div>
                  <div><Badge status={a.status as any} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
