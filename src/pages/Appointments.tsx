import { useAppointments } from '../contexts/AppointmentContext';
import { useAuth } from '../contexts/AuthContext';
import { Btn, Badge } from '../components/UI_New';

export default function Appointments(){
  const { appointments, cancel } = useAppointments();
  const { user } = useAuth();

  const mine = appointments.filter(a => a.usuario_id === user?.id);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-3">Meus Agendamentos</h2>
        <div className="space-y-3">
          {mine.length === 0 && <div className="text-gray-300">Nenhum agendamento</div>}
          {mine.map(a => (
            <div key={a.id} className="bg-gray-800 p-3 rounded">
              <div className="font-semibold">{a.servico_id}</div>
              <div className="text-sm text-gray-300">{new Date(a.data_hora).toLocaleString()}</div>
              <div className="flex gap-2 mt-2">
                {a.status !== 'canceled' && <Btn onClick={()=>cancel(a.id)} variant="secondary">Cancelar</Btn>}
                <div><Badge status={a.status as any} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
