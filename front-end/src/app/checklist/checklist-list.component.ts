import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChecklistService, Checklist } from '../shared/apis/checklist.service';
import { AuthService } from '../security/services/auth.service';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checklist-list.component.html',
  styleUrls: ['./checklist-list.component.css']
})
export class ChecklistListComponent implements OnInit {

  checklists: Checklist[] = [];
  filtroFechaDesde: string = '';
  filtroPlaca: string = '';
  filtroMovimiento: string = '';
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(
    private checklistService: ChecklistService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarChecklists();
  }

  // ─── CARGAR DATOS + REDIBUJO ───
  cargarChecklists(): void {
    this.cargando = true;
    this.limpiarMensaje();

    this.checklistService.listarTodos().subscribe({
      next: (data) => {
        this.checklists = data;
        this.cargando = false;
        this.cdr.markForCheck();   // ← REDIBUJA la tabla
      },
      error: (err) => {
        this.cargando = false;
        this.cdr.markForCheck();   // ← REDIBUJA aunque falle
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/']);
        } else {
          this.mostrarMensaje('Error al cargar checklists', 'error');
        }
      }
    });
  }

  nuevoChecklist(): void {
  this.router.navigate(['/dashboard/checklists/nuevo']);
  }

  // ─── BÚSQUEDA EN TIEMPO REAL ───
  get checklistsFiltrados(): Checklist[] {
    return this.checklists.filter(c => {
      const coincideFechaDesde = !this.filtroFechaDesde || c.fecha >= this.filtroFechaDesde;
      const coincidePlaca = !this.filtroPlaca || c.placa.toLowerCase().includes(this.filtroPlaca.toLowerCase());
      const coincideMov = !this.filtroMovimiento || c.movimiento.toLowerCase().includes(this.filtroMovimiento.toLowerCase());
      return coincideFechaDesde && coincidePlaca && coincideMov;
    });
  }

  filtrar(fechaDesde: string, placa: string, movimiento: string): void {
    this.filtroFechaDesde = fechaDesde;
    this.filtroPlaca = placa;
    this.filtroMovimiento = movimiento;
  }

  limpiar(inputFecha: HTMLInputElement, inputPlaca: HTMLInputElement, inputMov: HTMLInputElement): void {
    inputFecha.value = '';
    inputPlaca.value = '';
    inputMov.value = '';
    this.filtroFechaDesde = '';
    this.filtroPlaca = '';
    this.filtroMovimiento = '';
  }

  // ─── ELIMINAR + RECARGAR + REDIBUJO ───
  eliminar(id: number | undefined): void {
    if (!id) return;
    if (!confirm('¿Eliminar este checklist?')) return;

    this.checklistService.eliminar(id).subscribe({
      next: (mensaje: string) => {           // ← ahora recibe string
        this.mostrarMensaje(mensaje, 'exito'); // "Checklist eliminado correctamente"
        this.cargarChecklists();              // ← recarga la tabla
      },
      error: (err) => {
        this.mostrarMensaje('Error al eliminar', 'error');
        console.error(err);
      }
    });
  }

  verArchivo(ruta: string): void {
    if (ruta) window.open(ruta, '_blank');
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const [a, m, d] = fecha.split('-');
    return `${d}/${m}/${a}`;
  }

  formatearFechaSubida(fechaSubida?: string): string {
    if (!fechaSubida) return '—';
    const f = new Date(fechaSubida);
    return f.toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  obtenerIconoArchivo(nombre: string): string {
    const ext = nombre?.toLowerCase().split('.').pop();
    if (ext === 'pdf') return '📕';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return '🖼️';
    return '📎';
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