import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuiaService } from '../../services/guia';
import { ClienteService } from '../../services/cliente';
import { AuthService } from '../../services/auth';
import { Guia } from '../../checklist/models/guia.model';
import { Cliente } from '../../checklist/models/cliente.model';

@Component({
  selector: 'app-guia-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './guia-list.html',
  styleUrl: './guia-list.css'
})
export class GuiaListComponent implements OnInit {

  // ID del cliente que viene de la URL
  idCliente: number = 0;

  // Datos del cliente actual
  cliente: Cliente | null = null;

  // Lista de guias de este cliente
  guias: Guia[] = [];

  // Filtros del buscador
  filtroFecha: string = '';
  filtroGuia: string = '';
  filtroPlaca: string = '';

  // Estados
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private guiaService: GuiaService,
    private clienteService: ClienteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el idCliente de la URL (ej: /dashboard/guias/cliente/3)
    this.idCliente = Number(this.route.snapshot.paramMap.get('idCliente'));

    if (!this.idCliente || isNaN(this.idCliente)) {
      this.router.navigate(['/dashboard/guias']);
      return;
    }

    this.cargarDatos();
  }

  // Cargar cliente y sus guias
  cargarDatos(): void {
    this.cargando = true;
    this.mensaje = '';

    // Cargo los datos del cliente
    this.clienteService.obtenerPorId(this.idCliente).subscribe({
      next: (data) => {
        this.cliente = data;
      },
      error: () => {
        this.mostrarMensaje('Cliente no encontrado', 'error');
        this.cargando = false;
      }
    });

    // Cargo las guias de este cliente
    this.guiaService.listarPorCliente(this.idCliente).subscribe({
      next: (data) => {
        this.guias = data;
        this.cargando = false;
      },
      error: (error) => {
        if (error.status === 401) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        }
        this.mostrarMensaje('Error al cargar las guías', 'error');
        this.cargando = false;
      }
    });
  }

  // Buscar con filtros
  buscar(): void {
    // Si no hay filtros, recargo todo
    if (!this.filtroFecha && !this.filtroGuia && !this.filtroPlaca) {
      this.cargarDatos();
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    // Llamo al endpoint del backend:
    // GET /api/guias/cliente/{idCliente}/buscar?fecha=&numeroGuia=&placa=
    this.guiaService.buscarPorCliente(
      this.idCliente,
      this.filtroFecha,
      this.filtroGuia,
      this.filtroPlaca
    ).subscribe({
      next: (data) => {
        this.guias = data;
        this.cargando = false;

        if (data.length === 0) {
          this.mostrarMensaje('No se encontraron resultados', 'error');
        }
      },
      error: () => {
        this.mostrarMensaje('Error en la búsqueda', 'error');
        this.cargando = false;
      }
    });
  }

  // Limpiar filtros
  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroGuia = '';
    this.filtroPlaca = '';
    this.mensaje = '';
    this.cargarDatos();
  }

  // Ir al formulario para nueva guia
  nuevaGuia(): void {
    this.router.navigate(['/dashboard/guias/cliente', this.idCliente, 'nuevo']);
  }

  // Volver al panel de clientes
  volverClientes(): void {
    this.router.navigate(['/dashboard/guias']);
  }

  // Eliminar una guia
  eliminar(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta guía?')) {
      return;
    }

    this.guiaService.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje('Guía eliminada correctamente', 'exito');
        this.cargarDatos();
      },
      error: () => {
        this.mostrarMensaje('Error al eliminar', 'error');
      }
    });
  }

  // Ver archivo
  verArchivo(rutaArchivo: string): void {
    window.open(rutaArchivo, '_blank');
  }

  // Formatear fecha
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // Formatear fecha y hora de subida
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

  // Icono del archivo
  obtenerIconoArchivo(nombre: string): string {
    if (!nombre) return '📎';
    const ext = nombre.toLowerCase().split('.').pop();
    if (ext === 'pdf') return '📕';
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return '🖼️';
    return '📎';
  }

  // Mostrar mensaje
  mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }
}