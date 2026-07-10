import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente';
import { AuthService } from '../../services/auth';
import { Cliente } from '../../checklist/models/cliente.model';

@Component({
  selector: 'app-guia-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guia-clientes.html',
  styleUrl: './guia-clientes.css'
})
export class GuiaClientesComponent implements OnInit {

  // Lista de clientes del backend
  clientes: Cliente[] = [];

  // Para crear un cliente nuevo
  nuevoNombre: string = '';

  // Controlar el modal
  mostrandoModal: boolean = false;

  // Estados
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: string = '';

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  // Cargar todos los clientes
  cargarClientes(): void {
    this.cargando = true;
    this.mensaje = '';

    this.clienteService.listarTodos().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cargando = false;
      },
      error: (error) => {
        if (error.status === 401) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        }
        this.mostrarMensaje('Error al cargar los clientes', 'error');
        this.cargando = false;
      }
    });
  }

  // Abrir modal para nuevo cliente
  abrirModal(): void {
    this.nuevoNombre = '';
    this.mostrandoModal = true;
  }

  // Cerrar modal
  cerrarModal(): void {
    this.mostrandoModal = false;
    this.nuevoNombre = '';
  }

  // Guardar nuevo cliente
  guardarCliente(): void {
    // Validar que no este vacio
    const nombre = this.nuevoNombre.trim();
    if (!nombre) {
      this.mostrarMensaje('Escribe el nombre del cliente', 'error');
      return;
    }

    // Validar que no exista (busco en la lista local)
    const yaExiste = this.clientes.some(
      c => c.nombreCliente.toLowerCase() === nombre.toLowerCase()
    );
    if (yaExiste) {
      this.mostrarMensaje('Ya existe un cliente con ese nombre', 'error');
      return;
    }

    const nuevoCliente: Cliente = {
      id: 0,
      nombreCliente: nombre,
      fechaCreacion: ''
    };

    this.clienteService.crear(nuevoCliente).subscribe({
      next: (data) => {
        this.mostrarMensaje(`Cliente "${data.nombreCliente}" creado correctamente`, 'exito');
        this.cerrarModal();
        this.cargarClientes(); // recargo la lista
      },
      error: () => {
        this.mostrarMensaje('Error al crear el cliente', 'error');
      }
    });
  }

  // Entrar a un cliente (ver sus guias)
  entrarAlCliente(idCliente: number): void {
    this.router.navigate(['/dashboard/guias/cliente', idCliente]);
  }

  // Eliminar un cliente
  eliminarCliente(id: number, nombre: string): void {
    if (!confirm(`¿Estás seguro de eliminar el cliente "${nombre}" y TODAS sus guías?`)) {
      return;
    }

    this.clienteService.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje(`Cliente "${nombre}" eliminado`, 'exito');
        this.cargarClientes();
      },
      error: () => {
        this.mostrarMensaje('Error al eliminar el cliente', 'error');
      }
    });
  }

  // Formatear fecha de creacion
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const f = new Date(fecha);
    return f.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Mostrar mensaje temporal
  mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }

  // Obtener la inicial del nombre para el avatar
  obtenerInicial(nombre: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  // Colores para los avatares (rotar entre estos)
  obtenerColorAvatar(index: number): string {
    const colores = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
    return colores[index % colores.length];
  }
}