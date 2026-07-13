import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ─── Modelo ───
export interface Guia {
  id?: number;
  idCliente: number;
  fecha: string;           // yyyy-MM-dd
  numeroGuia: string;
  placa: string;
  motivoMovimiento: string;
  rutaArchivo: string;     // URL en la nube (R2/S3)
  nombreArchivo: string;
  fechaSubida?: string;    // ISO 8601
  nombreCliente?: string;  // Join con tabla clientes
}

@Injectable({ providedIn: 'root' })
export class GuiaService {
  private baseUrl = 'http://localhost:8080/api/guias';

  constructor(private http: HttpClient) {}

  /** GET /api/guias — Listar TODAS las guías de TODOS los clientes */
  listarTodas(): Observable<Guia[]> {
    return this.http.get<Guia[]>(this.baseUrl);
  }

  /** GET /api/guias/cliente/{idCliente} — Guías de un cliente específico */
  listarPorCliente(idCliente: number): Observable<Guia[]> {
    return this.http.get<Guia[]>(`${this.baseUrl}/cliente/${idCliente}`);
  }

  /** GET /api/guias/{id} — Obtener guía por ID */
  obtenerPorId(id: number): Observable<Guia> {
    return this.http.get<Guia>(`${this.baseUrl}/${id}`);
  }

  /** GET /api/guias/cliente/{idCliente}/buscar?fecha=&numeroGuia=&placa= */
  buscarPorCliente(
    idCliente: number,
    fecha?: string,
    numeroGuia?: string,
    placa?: string
  ): Observable<Guia[]> {
    const params: any = {};
    if (fecha)       params.fecha = fecha;
    if (numeroGuia)  params.numeroGuia = numeroGuia;
    if (placa)       params.placa = placa;
    return this.http.get<Guia[]>(`${this.baseUrl}/cliente/${idCliente}/buscar`, { params });
  }

  /** GET /api/guias/cliente/{idCliente}/exportar?fechaInicio=&fechaFin= */
  exportarPorCliente(
    idCliente: number,
    fechaInicio: string,
    fechaFin: string
  ): Observable<Guia[]> {
    return this.http.get<Guia[]>(
      `${this.baseUrl}/cliente/${idCliente}/exportar`,
      { params: { fechaInicio, fechaFin } }
    );
  }

  /** POST /api/guias — Crear nueva guía */
  crear(guia: Guia): Observable<Guia> {
    return this.http.post<Guia>(this.baseUrl, guia);
  }

  /** DELETE /api/guias/{id} — Eliminar guía */
  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}