import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Checklist } from '../checklist/models/checklist.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {

  // URL del backend Spring Boot
  private baseUrl = 'http://localhost:8080/api/checklists';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Crear los headers con el token JWT
  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los checklists
  listarTodos(): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  // Buscar por fecha y/o placa
  // Si un parametro es vacio, no se envia y el backend lo ignora
  buscar(fecha: string, placa: string): Observable<Checklist[]> {
    let params = '';
    if (fecha) params += `?fecha=${fecha}`;
    if (placa) {
      if (fecha) {
        params += `&placa=${placa}`;
      } else {
        params += `?placa=${placa}`;
      }
    }

    return this.http.get<Checklist[]>(`${this.baseUrl}/buscar${params}`, {
      headers: this.getHeaders()
    });
  }

  // Crear un nuevo checklist
  // Nota: el archivo se sube por separado a la nube (R2/S3)
  // Aqui solo envio los datos del formulario + la URL del archivo
  crear(checklist: Checklist): Observable<Checklist> {
    return this.http.post<Checklist>(this.baseUrl, checklist, {
      headers: this.getHeaders()
    });
  }

  // Eliminar un checklist
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // GET /api/checklists/exportar?fechaInicio=...&fechaFin=...
  exportarRango(fechaInicio: string, fechaFin: string): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(
      `${this.baseUrl}/exportar?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      { headers: this.getHeaders() }
    );
  }
}