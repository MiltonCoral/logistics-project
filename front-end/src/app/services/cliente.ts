import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../checklist/models/cliente.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  // URL del backend - endpoints de ClienteController
  private baseUrl = 'http://localhost:8080/api/clientes';

  constructor(
    private http: HttpClient
   // private authService: AuthService
  ) { }

  // Headers con token JWT
  //private getHeaders(): HttpHeaders {
  //  const token = this.authService.obtenerToken();
  //  return new HttpHeaders({
  //    'Authorization': `Bearer ${token}`
  //  });
  //}

  // GET /api/clientes - Listar todos los clientes
  listarTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl, {
    });
  }

  // GET /api/clientes/{id} - Obtener un cliente por ID
  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`, {
    });
  }

  // POST /api/clientes - Crear nuevo cliente
  // Body: { "nombreCliente": "NUEVO CLIENTE S.A." }
  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, cliente, {

    });
  }

  // DELETE /api/clientes/{id} - Eliminar cliente
  // Ojo: elimina tambien sus guias por CASCADE
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
   
    });
  }
}