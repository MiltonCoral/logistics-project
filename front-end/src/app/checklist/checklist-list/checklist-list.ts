import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ChecklistService } from '../../services/checklist';
import { AuthService } from '../../services/auth';
import { Checklist } from '../models/checklist.model';
import { FormsModule } from '@angular/forms';     

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checklist-list.html',
  styleUrl: './checklist-list.css'
})
export class ChecklistListComponent implements OnInit {

  // Lista de checklists que vienen del backend
  checklists: Checklist[] = [];

  // Campos del buscador
  filtroFecha: string = '';
  filtroPlaca: string = '';

  // Para mostrar loading mientras carga
  cargando: boolean = false;

  // Mensajes
  mensaje: string = '';
  tipoMensaje: string = ''; // 'exito' o 'error'

  constructor(
    private checklistService: ChecklistService,
    private authService: AuthService,
    private router: Router
  ) {}

  // Se ejecuta cuando el componente carga
  ngOnInit(): void {
    this.cargarChecklists();
  }

  // Cargar todos los checklists sin filtros
  cargarChecklists(): void {
    this.cargando = true;
    this.mensaje = '';

    this.checklistService.listarTodos().subscribe({
      next: (data) => {
        this.checklists = data;
        this.cargando = false;
      },
      error: (error) => {
        // Si da 401, el token expiró
        if (error.status === 401) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        }
        this.mostrarMensaje('Error al cargar los datos', 'error');
        this.cargando = false;
      }
    });
  }

  // Buscar con filtros de fecha y/o placa
  buscar(): void {
    // Si ambos filtros estan vacios, cargo todo
    if (!this.filtroFecha && !this.filtroPlaca) {
      this.cargarChecklists();
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    this.checklistService.buscar(this.filtroFecha, this.filtroPlaca).subscribe({
      next: (data) => {
        this.checklists = data;
        this.cargando = false;

        if (data.length === 0) {
          this.mostrarMensaje('No se encontraron resultados', 'error');
        }
      },
      error: (error) => {
        this.mostrarMensaje('Error en la búsqueda', 'error');
        this.cargando = false;
      }
    });
  }

  // Limpiar filtros y recargar
  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroPlaca = '';
    this.mensaje = '';
    this.cargarChecklists();
  }

  // Eliminar un checklist
  eliminar(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este registro?')) {
      return;
    }

    this.checklistService.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje('Registro eliminado correctamente', 'exito');
        this.cargarChecklists(); // recargo la lista
      },
      error: () => {
        this.mostrarMensaje('Error al eliminar', 'error');
      }
    });
  }

  // Ver el archivo (abre la URL en nueva pestaña)
  verArchivo(rutaArchivo: string): void {
    window.open(rutaArchivo, '_blank');
  }

  // Mostrar mensaje temporal
  mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;

    // Desaparece despues de 4 segundos
    setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }

  // Formatear la fecha para mostrarla bonita
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // Formatear la fecha y hora de subida
  formatearFechaSubida(fechaSubida: string): string {
    if (!fechaSubida) return '';
    const fecha = new Date(fechaSubida);
    return fecha.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtener icono segun el tipo de archivo
  obtenerIconoArchivo(nombre: string): string {
    if (!nombre) return '📎';
    const ext = nombre.toLowerCase().split('.').pop();
    if (ext === 'pdf') return '📕';
    if (ext === 'jpg' || ext === 'jpeg') return '🖼️';
    if (ext === 'png') return '🖼️';
    return '📎';
  }
}