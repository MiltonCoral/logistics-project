import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ─── Modelo ───
export interface Cliente {
  id?: number;
  nombreCliente: string;
  fechaCreacion?: string;  // ISO 8601 del backend
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private baseUrl = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) {}

  /** GET /api/clientes — Listar todos los clientes */
  listarTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl);
  }

  /** GET /api/clientes/{id} — Obtener cliente por ID */
  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  /** POST /api/clientes — Crear nuevo cliente */
  crear(cliente: Cliente): Observable<string> {
    return this.http.post(this.baseUrl, cliente, { responseType: 'text' });
  }

  /** DELETE /api/clientes/{id} — Eliminar cliente (cascadea sus guías) */
  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}