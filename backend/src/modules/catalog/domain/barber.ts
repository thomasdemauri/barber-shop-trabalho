export type Barber = {
  id: string;
  userId: string;
  name: string;
  experience: string | null;
  bio: string | null;
  rating: number;
  reviews: number;
};

export interface BarberRepository {
  list(): Promise<Barber[]>;
  findById(id: string): Promise<Barber | null>;
  findByUserId(userId: string): Promise<Barber | null>;
}
