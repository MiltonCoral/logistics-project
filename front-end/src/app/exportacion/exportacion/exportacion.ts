import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente';
import { ChecklistService } from '../../services/checklist';
import { GuiaService } from '../../services/guia';
import { AuthService } from '../../services/auth';
import { Cliente } from '../../checklist/models/cliente.model';
import { Checklist } from '../../checklist/models/checklist.model';
import { Guia } from '../../checklist/models/guia.model';
import { PDFDocument } from 'pdf-lib'; // La librería que instalé

@Component({
  selector: 'app-exportacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exportacion.html',
  styleUrl: './exportacion.css'
})
export class ExportacionComponent implements OnInit {

  // Lista de clientes para el dropdown
  clientes: Cliente[] = [];

  // Selectores del formulario
  seccion: string = 'checklist'; // 'checklist' o 'guia'
  idClienteSeleccionado: number = 0;
  fechaInicio: string = '';
  fechaFin: string = '';

  // Resultados de la búsqueda
  resultados: any[] = []; // Puede ser Checklist[] o Guia[]
  hayResultados: boolean = false;

  // Estados
  cargando: boolean = false;
  descargandoPdf: boolean = false;
  mensaje: string = '';
  tipoMensaje: string = '';

  constructor(
    private clienteService: ClienteService,
    private checklistService: ChecklistService,
    private guiaService: GuiaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Cargo los clientes por si elige la sección de guías
    this.clienteService.listarTodos().subscribe({
      next: (data) => this.clientes = data
    });

    // Pongo fechas por defecto (primer y último día del mes actual)
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    this.fechaInicio = primerDia.toISOString().split('T')[0];
    this.fechaFin = ultimoDia.toISOString().split('T')[0];
  }

  // Buscar según la sección elegida
  buscar(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.mostrarMensaje('Selecciona fecha inicio y fecha fin', 'error');
      return;
    }
    if (this.seccion === 'guia' && !this.idClienteSeleccionado) {
      this.mostrarMensaje('Selecciona un cliente', 'error');
      return;
    }

    this.cargando = true;
    this.hayResultados = false;
    this.resultados = [];

    if (this.seccion === 'checklist') {
      this.checklistService.exportarRango(this.fechaInicio, this.fechaFin).subscribe({
        next: (data) => {
          this.resultados = data;
          this.hayResultados = true;
          this.cargando = false;
        },
        error: () => {
          this.mostrarMensaje('Error al buscar checklists', 'error');
          this.cargando = false;
        }
      });
    } else {
      this.guiaService.exportarRango(this.idClienteSeleccionado, this.fechaInicio, this.fechaFin).subscribe({
        next: (data) => {
          this.resultados = data;
          this.hayResultados = true;
          this.cargando = false;
        },
        error: () => {
          this.mostrarMensaje('Error al buscar guías', 'error');
          this.cargando = false;
        }
      });
    }
  }

  // IMPRIMIR: Simple, llama al print del navegador
  // El CSS @media print oculta lo que no sea la tabla
  imprimir(): void {
    window.print();
  }

  // DESCARGAR PDF ÚNICO: Aquí está la magia
  async descargarPdfUnico(): Promise<void> {
    if (this.resultados.length === 0) return;

    this.descargandoPdf = true;
    this.mostrarMensaje('Generando PDF, esto puede tardar unos segundos...', 'exito');

    try {
      // Crear un documento PDF vacío
      const pdfDoc = await PDFDocument.create();

      for (const reg of this.resultados) {
        try {
          // 1. Descargar el archivo desde la URL (R2/S3)
          const response = await fetch(reg.rutaArchivo);
          const arrayBuffer = await response.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          const nombre = reg.nombreArchivo.toLowerCase();

          // 2. Si es PDF, insertar sus páginas
          if (nombre.endsWith('.pdf')) {
            const donorPdf = await PDFDocument.load(bytes);
            const paginasCopiadas = await pdfDoc.copyPages(donorPdf, donorPdf.getPageIndices());
            paginasCopiadas.forEach(pagina => {
              pdfDoc.addPage(pagina);
            });
          } 
          // 3. Si es JPG o PNG, convertir a página
          else if (nombre.endsWith('.jpg') || nombre.endsWith('.jpeg') || nombre.endsWith('.png')) {
            let imagen;
            if (nombre.endsWith('.png')) {
              imagen = await pdfDoc.embedPng(bytes);
            } else {
              imagen = await pdfDoc.embedJpg(bytes);
            }

            // Crear una página tamaño A4
            const pagina = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos
            
            // Calcular tamaño para que quepa en la hoja manteniendo proporción
            const anchoPagina = pagina.getWidth();
            const altoPagina = pagina.getHeight();
            const margen = 50;

            const escalaAncho = (anchoPagina - margen * 2) / imagen.width;
            const escalaAlto = (altoPagina - margen * 2) / imagen.height;
            const escalaFinal = Math.min(escalaAncho, escalaAlto);

            const anchoImagen = imagen.width * escalaFinal;
            const altoImagen = imagen.height * escalaFinal;

            // Centrar la imagen en la página
            const x = (anchoPagina - anchoImagen) / 2;
            const y = (altoPagina - altoImagen) / 2;

            pagina.drawImage(imagen, {
              x: x,
              y: y,
              width: anchoImagen,
              height: altoImagen,
            });
          }
        } catch (error) {
          console.error('Error al procesar el archivo: ', reg.nombreArchivo, error);
        }
      }

      // 4. Guardar el PDF y forzar la descarga
      //const pdfBytes = await pdfDoc.save();
      //const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      //const url = window.URL.createObjectURL(blob);
      const pdfBytes = await pdfDoc.save();
      // Lo envuelvo en un nuevo Uint8Array para que TypeScript esté feliz
      const pdfFinal = new Uint8Array(pdfBytes);
      const blob = new Blob([pdfFinal], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `documentos_${this.fechaInicio}_a_${this.fechaFin}.pdf`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      this.mostrarMensaje('PDF descargado correctamente', 'exito');

    } catch (error) {
      console.error(error);
      this.mostrarMensaje('Hubo un error al generar el PDF. Revisa la consola.', 'error');
    } finally {
      this.descargandoPdf = false;
    }
  }

  // Formatear fecha para la tabla
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // Mostrar mensaje
  mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.mensaje = ''; }, 5000);
  }
}