// Modelo que representa un checklist del backend
// Mapea directo con la tabla "checklists" de PostgreSQL

export interface Checklist {
  id: number;
  fecha: string;           // formato yyyy-MM-dd
  placa: string;
  movimiento: string;
  rutaArchivo: string;     // URL del archivo en la nube
  nombreArchivo: string;   // nombre del archivo original
  fechaSubida: string;     // timestamp cuando se subió
}

