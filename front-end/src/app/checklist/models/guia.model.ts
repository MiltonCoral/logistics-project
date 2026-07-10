// Modelo que mapea con la tabla "guias" del backend
// Endpoint: /api/guias
// Cada guia pertenece a un cliente

export interface Guia {
  id: number;
  idCliente: number;
  fecha: string;              // formato yyyy-MM-dd
  numeroGuia: string;
  placa: string;
  motivoMovimiento: string;
  rutaArchivo: string;        // URL del archivo en la nube
  nombreArchivo: string;      // nombre del archivo original
  fechaSubida: string;        // timestamp
  nombreCliente?: string;     // viene del JOIN en el backend
}