import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChecklistService, Checklist } from '../../../shared/apis/checklist.service';
import { FileUploadService, UploadFileResponse } from '../../../shared/apis/file-upload.service';

@Component({
  selector: 'app-subir-checklist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subir-checklist.component.html',
  styleUrls: ['./subir-checklist.component.css']
})
export class SubirChecklistComponent {

  @ViewChild('inputFecha') inputFecha!: ElementRef<HTMLInputElement>;
  @ViewChild('inputPlaca') inputPlaca!: ElementRef<HTMLInputElement>;
  @ViewChild('inputMovimiento') inputMovimiento!: ElementRef<HTMLInputElement>;
  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';

  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';
  errores: Record<string, string> = {};

  constructor(
    private checklistService: ChecklistService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  volver(): void {
    this.router.navigate(['/dashboard/checklists']);
  }

  irAChecklists(): void {
    this.router.navigate(['/dashboard/checklists']);
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
    const placa = this.inputPlaca.nativeElement.value.trim();
    const movimiento = this.inputMovimiento.nativeElement.value.trim();

    if (!fecha) {
      this.errores['fecha'] = 'La fecha es obligatoria';
      valido = false;
    }

    if (!placa) {
      this.errores['placa'] = 'La placa es obligatoria';
      valido = false;
    }

    if (!movimiento) {
      this.errores['movimiento'] = 'El movimiento es obligatorio';
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
        const nuevoChecklist: Checklist = {
          fecha: this.inputFecha.nativeElement.value,
          placa: this.inputPlaca.nativeElement.value.trim().toUpperCase(),
          movimiento: this.inputMovimiento.nativeElement.value.trim(),
          rutaArchivo: uploadResponse.fileDownloadUri,
          nombreArchivo: uploadResponse.fileName
        };

        this.checklistService.crear(nuevoChecklist).subscribe({
          next: () => {
            this.mostrarMensaje('Check List subido correctamente', 'exito');
            this.limpiarFormulario();
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.mostrarMensaje('Error al guardar el checklist', 'error');
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
    this.inputPlaca.nativeElement.value = '';
    this.inputMovimiento.nativeElement.value = '';
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