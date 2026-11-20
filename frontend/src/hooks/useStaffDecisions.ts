import { useState } from 'react';
import toast from 'react-hot-toast';
import { errorMessage } from '../api/client';
import { useAppointments } from './useAppointments';
import type { StaffDecision } from '../contexts/appointments';

const SUCCESS_MESSAGES: Record<StaffDecision, string> = {
  CONFIRMED: 'Agendamento confirmado!',
  CANCELED: 'Agendamento cancelado.',
  COMPLETED: 'Atendimento concluído!',
};

/** Confirm / refuse / complete with loading state and toasts, shared by the staff screens. */
export function useStaffDecisions() {
  const { decide } = useAppointments();
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (id: string, decision: StaffDecision) => {
    setBusyId(id);
    try {
      await decide(id, decision);
      toast.success(SUCCESS_MESSAGES[decision]);
    } catch (error) {
      toast.error(errorMessage(error, 'Não foi possível atualizar o agendamento.'));
    } finally {
      setBusyId(null);
    }
  };

  return { busyId, decide: run };
}
