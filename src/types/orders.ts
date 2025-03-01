// src/types/orders.ts
export interface Event {
  id: string;
  name: string;
  start_date: string;
  // otras propiedades
}

export interface Order {
  id: string;
  events: Event; // O Event[] si es un array
  // otras propiedades
}
