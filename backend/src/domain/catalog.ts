export type SeedService = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  price: number;
  durationMinutes: number;
};

export const DEFAULT_SERVICES: SeedService[] = [
  { id: 'corte-C', name: 'Corte Clássico', description: 'Tesoura ou máquina', icon: 'C', category: 'corte', price: 40, durationMinutes: 40 },
  { id: 'combo-CB', name: 'Corte + Barba', description: 'Combo premium', icon: 'CB', category: 'combo', price: 65, durationMinutes: 70 },
  { id: 'barba-B', name: 'Barba Completa', description: 'Navalha profissional', icon: 'B', category: 'barba', price: 35, durationMinutes: 30 },
  { id: 'trat-H', name: 'Hidratação Capilar', description: 'Tratamento profundo', icon: 'H', category: 'trat', price: 30, durationMinutes: 20 },
  { id: 'trat-D', name: 'Design de Sobrancelha', description: 'Modelagem precisa', icon: 'D', category: 'trat', price: 20, durationMinutes: 15 },
  { id: 'trat-Co', name: 'Coloração', description: 'Platinado, luzes, ombré', icon: 'Co', category: 'trat', price: 120, durationMinutes: 90 },
];
