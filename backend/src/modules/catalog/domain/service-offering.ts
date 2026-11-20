import { ValidationError } from '../../../shared/domain/errors.js';
import { newId } from '../../../shared/domain/id.js';

export type ServiceOfferingProps = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  price: number;
  durationMinutes: number;
  active: boolean;
};

export type ServiceOfferingChanges = Partial<Omit<ServiceOfferingProps, 'id'>>;

function validated(props: ServiceOfferingProps): ServiceOfferingProps {
  const name = props.name.trim();
  if (name.length < 2) throw new ValidationError('Nome do serviço deve ter ao menos 2 caracteres');
  if (!props.category.trim()) throw new ValidationError('Categoria é obrigatória');
  if (!Number.isFinite(props.price) || props.price < 0) throw new ValidationError('Preço não pode ser negativo');
  if (!Number.isInteger(props.durationMinutes) || props.durationMinutes <= 0) {
    throw new ValidationError('Duração deve ser um número inteiro positivo de minutos');
  }
  return { ...props, name, price: Math.round(props.price * 100) / 100 };
}

/** A service the shop sells (named "offering" to avoid clashing with application services). */
export class ServiceOffering {
  private constructor(private props: ServiceOfferingProps) {}

  static create(input: Omit<ServiceOfferingProps, 'id' | 'active'> & { id?: string }) {
    return new ServiceOffering(validated({ ...input, id: input.id ?? newId(), active: true }));
  }

  static restore(props: ServiceOfferingProps) {
    return new ServiceOffering({ ...props });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get price() { return this.props.price; }
  get durationMinutes() { return this.props.durationMinutes; }
  get active() { return this.props.active; }

  update(changes: ServiceOfferingChanges) {
    this.props = validated({ ...this.props, ...changes, id: this.props.id });
  }

  toSnapshot(): ServiceOfferingProps {
    return { ...this.props };
  }
}

export interface ServiceOfferingRepository {
  findById(id: string): Promise<ServiceOffering | null>;
  list(options: { includeInactive: boolean }): Promise<ServiceOffering[]>;
  save(service: ServiceOffering): Promise<void>;
}
