import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService, Cliente } from '../shared/apis/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guias-cliente.component.html',
  styleUrls: ['./guias-cliente.component.css']
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[] = [];
  cargando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  mostrandoModal = false;

  @ViewChild('inputNombre') inputNombre!: ElementRef<HTMLInputElement>;

  private coloresAvatar = [
    '#f59e0b', '#ef4444', '#3b82f6', '#10b981',
    '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
  ];

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef          // ← INYECTAMOS
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.limpiarMensaje();
    this.clienteService.listarTodos().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cdr.markForCheck();  // ← FORZAMOS A ANGULAR A REPINTAR
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar clientes', 'error');
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  guardarCliente(): void {
    const nombre = this.inputNombre.nativeElement.value.trim();
    if (!nombre) { this.mostrarMensaje('El nombre es obligatorio', 'error'); return; }
    this.clienteService.crear({ nombreCliente: nombre }).subscribe({
      next: () => { this.mostrarMensaje('Cliente creado', 'exito'); this.cerrarModal(); this.cargarClientes(); },
      error: (err) => { this.mostrarMensaje('Error al crear', 'error'); console.error(err); this.cerrarModal();  this.cdr.markForCheck();}
    });
  }

  eliminarCliente(id: number | undefined, nombre: string): void {
    if (!id) return;
    if (!confirm(`¿Eliminar "${nombre}"?\nTambién se borrarán sus guías.`)) return;
    this.clienteService.eliminar(id).subscribe({
      next: (mensaje) => { 
        this.mostrarMensaje(mensaje, 'exito'); // usa el mensaje del backend directamente
        this.cargarClientes(); 
      },
      error: (err) => { this.mostrarMensaje('Error al eliminar', 'error'); console.error(err); this.cdr.markForCheck();}
    });
  }

  entrarAlCliente(id: number | undefined): void {
    if (!id) return;
    console.log('Entrar al cliente:', id);
  }

  obtenerInicial(nombre: string): string {
    return nombre?.charAt(0).toUpperCase() ?? '?';
  }

  obtenerColorAvatar(index: number): string {
    return this.coloresAvatar[index % this.coloresAvatar.length];
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  abrirModal(): void {
    this.mostrandoModal = true;
    this.limpiarMensaje();
  }

  cerrarModal(): void {
    this.mostrandoModal = false;
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => this.limpiarMensaje(), 4000);
  }

  private limpiarMensaje(): void {
    this.mensaje = '';
    this.tipoMensaje = '';
  }
}