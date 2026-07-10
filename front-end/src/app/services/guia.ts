import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Guia } from '../checklist/models/guia.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class GuiaService {

  // URL del backend - endpoints de GuiaController
  private baseUrl = 'http://localhost:8080/api/guias';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Headers con token JWT
  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // GET /api/guias/cliente/{idCliente}
  // Listar todas las guias de un cliente especifico
  listarPorCliente(idCliente: number): Observable<Guia[]> {
    return this.http.get<Guia[]>(`${this.baseUrl}/cliente/${idCliente}`, {
      headers: this.getHeaders()
    });
  }

  // GET /api/guias/cliente/{idCliente}/buscar?fecha=&numeroGuia=&placa=
  // Buscar guias de un cliente por filtros
  buscarPorCliente(
    idCliente: number,
    fecha: string,
    numeroGuia: string,
    placa: string
  ): Observable<Guia[]> {
    let params = '';

    // Armo los query params uno por uno
    // Solo agrego los que tengan valor
    if (fecha) {
      params += `?fecha=${fecha}`;
    }
    if (numeroGuia) {
      params += fecha ? `&numeroGuia=${numeroGuia}` : `?numeroGuia=${numeroGuia}`;
    }
    if (placa) {
      params += (fecha || numeroGuia) ? `&placa=${placa}` : `?placa=${placa}`;
    }

    return this.http.get<Guia[]>(
      `${this.baseUrl}/cliente/${idCliente}/buscar${params}`,
      { headers: this.getHeaders() }
    );
  }

  // POST /api/guias
  // Crear una nueva guia
  // Body: { idCliente, fecha, numeroGuia, placa, motivoMovimiento, rutaArchivo, nombreArchivo }
  crear(guia: Guia): Observable<Guia> {
    return this.http.post<Guia>(this.baseUrl, guia, {
      headers: this.getHeaders()
    });
  }

  // DELETE /api/guias/{id}
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // GET /api/guias/cliente/{idCliente}/exportar?fechaInicio=...&fechaFin=...
  exportarRango(idCliente: number, fechaInicio: string, fechaFin: string): Observable<Guia[]> {
    return this.http.get<Guia[]>(
      `${this.baseUrl}/cliente/${idCliente}/exportar?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      { headers: this.getHeaders() }
    );
  }
}