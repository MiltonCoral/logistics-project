// Modelo que mapea con la tabla "clientes" del backend
// Endpoint: /api/clientes

export interface Cliente {
  id: number;
  nombreCliente: string;
  fechaCreacion: string;
}
