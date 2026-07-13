import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { GuiaService, Guia } from '../../shared/apis/guia.service';
import { ClienteService, Cliente } from '../../shared/apis/cliente.service';
import { AuthService } from '../../security/services/auth.service';

@Component({
  selector: 'app-lista-guias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-guias.component.html',
  styleUrls: ['./lista-guias.component.css']
})
export class ListaGuiasComponent implements OnInit {

  idCliente: number = 0;
  cliente: Cliente | null = null;
  guias: Guia[] = [];
  guiasTodas: Guia[] = []; // ← copia original para filtrar local

  mensaje: string = '';
  tipoMensaje: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private guiaService: GuiaService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.idCliente = Number(this.route.snapshot.paramMap.get('idCliente'));

    if (!this.idCliente || isNaN(this.idCliente)) {
      this.router.navigate(['/dashboard/guias']);
      return;
    }

    this.cargarDatos();
  }

  cargarDatos(): void {
    this.mensaje = '';

    // Datos del cliente
    this.clienteService.obtenerPorId(this.idCliente).subscribe({
      next: (data) => {this.cliente = data,  this.cdr.markForCheck();},
      error: () => {this.mostrarMensaje('Cliente no encontrado', 'error') ,this.cdr.markForCheck();}
    });

    // Guías del cliente
    this.guiaService.listarPorCliente(this.idCliente).subscribe({
      next: (data) => {
        this.guiasTodas = data;
        this.guias = data;
        this.cdr.markForCheck();
      },
      error: (error) => {
        if (error.status === 401) {
          this.authService.logout();
          return;
        }
        this.mostrarMensaje('Error al cargar las guías', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  // ← FILTRO EN TIEMPO REAL LOCAL (sin tocar el backend)
  filtrar(fecha: string, guia: string, placa: string): void {
    const f = fecha.trim();
    const g = guia.trim().toLowerCase();
    const p = placa.trim().toLowerCase();

    if (!f && !g && !p) {
      this.guias = this.guiasTodas;
      return;
    }

    this.guias = this.guiasTodas.filter(item => {
      const matchFecha = !f || item.fecha >= f;
      const matchGuia = !g || item.numeroGuia.toLowerCase().includes(g);
      const matchPlaca = !p || item.placa.toLowerCase().includes(p);
      return matchFecha && matchGuia && matchPlaca;
    });
  }

  limpiar(
    inputFecha: HTMLInputElement,
    inputGuia: HTMLInputElement,
    inputPlaca: HTMLInputElement
  ): void {
    inputFecha.value = '';
    inputGuia.value = '';
    inputPlaca.value = '';
    this.guias = this.guiasTodas;
    this.mensaje = '';
  }

  nuevaGuia(): void {
    this.router.navigate(['/dashboard/guias/cliente', this.idCliente, 'nuevo']);
  }

  volverClientes(): void {
    this.router.navigate(['/dashboard/guias']);
  }

  eliminar(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta guía?')) return;

    this.guiaService.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje('Guía eliminada correctamente', 'exito');
        this.cargarDatos();
        this.cdr.markForCheck();
      },
      error: () => {
        this.mostrarMensaje('Error al eliminar', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  verArchivo(rutaArchivo: string): void {
    window.open(rutaArchivo, '_blank');
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  formatearFechaSubida(fechaSubida: string | undefined): string {
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

  obtenerIconoArchivo(nombre: string): string {
    if (!nombre) return '📎';
    const ext = nombre.toLowerCase().split('.').pop();
    if (ext === 'pdf') return '📕';
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return '🖼️';
    return '📎';
  }

  mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 4000);
  }
}