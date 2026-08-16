import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Checklist {
  id?: number;
  fecha: string;
  placa: string;
  movimiento: string;
  rutaArchivo: string;
  nombreArchivo: string;
  fechaSubida?: string;
}

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  private baseUrl = 'http://localhost:8080/api/checklists';

  constructor(private http: HttpClient) {}

  /** GET /api/checklists — Listar todos */
  listarTodos(): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(this.baseUrl);
  }

  /** GET /api/checklists/{id} — Obtener por ID */
  obtenerPorId(id: number): Observable<Checklist> {
    return this.http.get<Checklist>(`${this.baseUrl}/${id}`);
  }

  /** GET /api/checklists/buscar?fecha=&placa= */
  buscar(fecha?: string, placa?: string): Observable<Checklist[]> {
    const params: any = {};
    if (fecha) params.fecha = fecha;
    if (placa) params.placa = placa;
    return this.http.get<Checklist[]>(`${this.baseUrl}/buscar`, { params });
  }

  /** GET /api/checklists/exportar?fechaInicio=&fechaFin= */
  exportar(fechaInicio: string, fechaFin: string): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(`${this.baseUrl}/exportar`, {
      params: { fechaInicio, fechaFin }
    });
  }

  /** POST /api/checklists — Crear nuevo */
  crear(checklist: Checklist): Observable<Checklist> {
    return this.http.post<Checklist>(this.baseUrl, checklist);
  }

  /** DELETE /api/checklists/{id} — Eliminar checklist */
  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      responseType: 'text'   // ← IMPORTANTE: el backend devuelve texto, no JSON
    });
  }
}