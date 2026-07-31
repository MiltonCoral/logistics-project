import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService, Cliente } from '../../../shared/apis/cliente.service';
import { GuiaService, Guia } from '../../../shared/apis/guia.service';
import { FileUploadService, UploadFileResponse } from '../../../shared/apis/file-upload.service';

@Component({
  selector: 'app-subir-guia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subir-guia.component.html',
  styleUrls: ['./subir-guia.component.css']
})
export class SubirGuiaComponent implements OnInit {

  @ViewChild('inputFecha') inputFecha!: ElementRef<HTMLInputElement>;
  @ViewChild('inputNumeroGuia') inputNumeroGuia!: ElementRef<HTMLInputElement>;
  @ViewChild('inputPlaca') inputPlaca!: ElementRef<HTMLInputElement>;
  @ViewChild('inputMotivo') inputMotivo!: ElementRef<HTMLInputElement>;
  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  idCliente!: number;
  cliente: Cliente | null = null;

  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';

  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  errores: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private guiaService: GuiaService,
    private fileUploadService: FileUploadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idCliente = Number(this.route.snapshot.paramMap.get('idCliente'));
    if (!this.idCliente || isNaN(this.idCliente)) {
      this.router.navigate(['/dashboard/guias']);
      return;
    }
    this.cargarCliente();
  }

  cargarCliente(): void {
    this.clienteService.obtenerPorId(this.idCliente).subscribe({
      next: (data) => {
        this.cliente = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mostrarMensaje('Error al cargar el cliente', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/guias/cliente', this.idCliente]);
  }

  irAGuias(): void {
    this.router.navigate(['/dashboard/guias']);
  }

  abrirSelectorArchivo(): void {
    this.inputArchivo.nativeElement.click();
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const permitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

      if (!permitidos.includes(file.type)) {
        this.mostrarMensaje('Formato no permitido. Usa PDF, JPG o PNG.', 'error');
        this.limpiarArchivo();
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.mostrarMensaje('El archivo excede 10MB.', 'error');
        this.limpiarArchivo();
        return;
      }

      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
      this.cdr.markForCheck();
    }
  }

  limpiarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.inputArchivo.nativeElement.value = '';
    this.cdr.markForCheck();
  }

  validar(): boolean {
    this.errores = {};
    let valido = true;

    const fecha = this.inputFecha.nativeElement.value.trim();
    const numeroGuia = this.inputNumeroGuia.nativeElement.value.trim();
    const placa = this.inputPlaca.nativeElement.value.trim();
    const motivo = this.inputMotivo.nativeElement.value.trim();

    if (!fecha) {
      this.errores['fecha'] = 'La fecha es obligatoria';
      valido = false;
    }

    if (!numeroGuia) {
      this.errores['numeroGuia'] = 'El número de guía es obligatorio';
      valido = false;
    }

    if (!placa) {
      this.errores['placa'] = 'La placa es obligatoria';
      valido = false;
    }

    if (!motivo) {
      this.errores['motivo'] = 'El motivo de movimiento es obligatorio';
      valido = false;
    }

    if (!this.archivoSeleccionado) {
      this.errores['archivo'] = 'Debes seleccionar un archivo';
      valido = false;
    }

    this.cdr.markForCheck();
    return valido;
  }

  submit(): void {
    if (!this.validar()) return;

    this.fileUploadService.uploadFile(this.archivoSeleccionado!).subscribe({
      next: (uploadResponse: UploadFileResponse) => {
        const nuevaGuia: Guia = {
          idCliente: this.idCliente,
          fecha: this.inputFecha.nativeElement.value,
          numeroGuia: this.inputNumeroGuia.nativeElement.value.trim(),
          placa: this.inputPlaca.nativeElement.value.trim().toUpperCase(),
          motivoMovimiento: this.inputMotivo.nativeElement.value.trim(),
          rutaArchivo: uploadResponse.fileDownloadUri,
          nombreArchivo: uploadResponse.fileName
        };

        this.guiaService.crear(nuevaGuia).subscribe({
          next: () => {
            this.mostrarMensaje('Guía guardada correctamente', 'exito');
            this.limpiarFormulario();
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.mostrarMensaje('Error al guardar la guía', 'error');
            console.error(err);
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.mostrarMensaje('Error al subir el archivo', 'error');
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

  tieneError(campo: string): boolean {
    return !!this.errores[campo];
  }

  mensajeError(campo: string): string {
    return this.errores[campo] || '';
  }

  limpiarFormulario(): void {
    this.inputFecha.nativeElement.value = '';
    this.inputNumeroGuia.nativeElement.value = '';
    this.inputPlaca.nativeElement.value = '';
    this.inputMotivo.nativeElement.value = '';
    this.limpiarArchivo();
    this.errores = {};
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
      this.cdr.markForCheck();
    }, 4000);
  }
}