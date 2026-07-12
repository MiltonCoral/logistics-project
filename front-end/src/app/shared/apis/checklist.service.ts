import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ─── Modelo ───
export interface Checklist {
  id?: number;
  fecha: string;           // yyyy-MM-dd
  placa: string;
  movimiento: string;
  rutaArchivo: string;     // URL en la nube (R2/S3)
  nombreArchivo: string;
  fechaSubida?: string;    // ISO 8601
}

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  private baseUrl = 'http://localhost:8080/api/checklists';

  constructor(private http: HttpClient) {}

  /** GET /api/checklists — Listar todos (ordenados por fecha DESC) */
  listarTodos(): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(this.baseUrl);
  }

  /** GET /api/checklists/{id} — Obtener checklist por ID */
  obtenerPorId(id: number): Observable<Checklist> {
    return this.http.get<Checklist>(`${this.baseUrl}/${id}`);
  }

  /** GET /api/checklists/buscar?fecha=&placa= — Filtrar por fecha y/o placa */
  buscar(fecha?: string, placa?: string): Observable<Checklist[]> {
    const params: any = {};
    if (fecha) params.fecha = fecha;
    if (placa) params.placa = placa;
    return this.http.get<Checklist[]>(`${this.baseUrl}/buscar`, { params });
  }

  /** GET /api/checklists/exportar?fechaInicio=&fechaFin= — Rango de fechas */
  exportar(fechaInicio: string, fechaFin: string): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(`${this.baseUrl}/exportar`, {
      params: { fechaInicio, fechaFin }
    });
  }

  /** POST /api/checklists — Crear nuevo checklist */
  crear(checklist: Checklist): Observable<Checklist> {
    return this.http.post<Checklist>(this.baseUrl, checklist);
  }

  /** DELETE /api/checklists/{id} — Eliminar checklist */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}