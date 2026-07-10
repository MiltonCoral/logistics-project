import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChecklistService } from '../../services/checklist';
import { AuthService } from '../../services/auth';
import { Checklist } from '../models/checklist.model';

@Component({
  selector: 'app-checklist-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checklist-form.html',
  styleUrl: './checklist-form.css'
})
export class ChecklistFormComponent implements OnInit {

  // Formulario reactivo
  formulario: FormGroup;

  // El archivo que se va a adjuntar
  archivoSeleccionado: File | null = null;

  // Para preview del nombre del archivo
  nombreArchivo: string = '';

  // Estados
  enviando: boolean = false;
  mensaje: string = '';
  tipoMensaje: string = '';

  // Tipos de archivo permitidos
  tiposPermitidos: string[] = ['application/pdf', 'image/jpeg', 'image/png'];

  constructor(
    private fb: FormBuilder,
    private checklistService: ChecklistService,
    private authService: AuthService,
    private router: Router
  ) {
    // Creo el formulario con validaciones
    this.formulario = this.fb.group({
      fecha: ['', Validators.required],
      placa: ['', [Validators.required, Validators.maxLength(20)]],
      movimiento: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    // Poner la fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    this.formulario.patchValue({ fecha: hoy });
  }

  // Cuando el usuario selecciona un archivo
  onArchivoSeleccionado(event: any): void {
    const archivo: File = event.target.files[0];

    if (!archivo) {
      return;
    }

    // Validar tipo de archivo
    if (!this.tiposPermitidos.includes(archivo.type)) {
      this.mostrarMensaje('Solo se permite PDF, JPG o PNG', 'error');
      this.limpiarArchivo();
      return;
    }

    // Validar tamano (maximo 10MB)
    if (archivo.size > 10 * 1024 * 1024) {
      this.mostrarMensaje('El archivo no puede ser mayor a 10MB', 'error');
      this.limpiarArchivo();
      return;
    }

    this.archivoSeleccionado = archivo;
    this.nombreArchivo = archivo.name;
    this.mensaje = '';
  }

  // Quitar el archivo seleccionado
  limpiarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    // Limpiar el input file
    const inputArchivo = document.getElementById('inputArchivo') as HTMLInputElement;
    if (inputArchivo) {
      inputArchivo.value = '';
    }
  }
  // Abrir la ventana para seleccionar archivo
  abrirSelectorArchivo(): void {
  const inputArchivo = document.getElementById('inputArchivo') as HTMLInputElement;
  if (inputArchivo) {
    inputArchivo.click();
  }
}

  // Enviar el formulario
  submit(): void {
    // Marcar todos los campos como tocados para mostrar errores
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      this.mostrarMensaje('Completa todos los campos obligatorios', 'error');
      return;
    }

    if (!this.archivoSeleccionado) {
      this.mostrarMensaje('Debes adjuntar un archivo escaneado', 'error');
      return;
    }

    this.enviando = true;
    this.mensaje = '';

    // IMPORTANTE: Como el backend guarda la URL del archivo en la nube (R2/S3),
    // en un caso real primero subiría el archivo a la nube y obtendría la URL.
    // Por ahora, envío una URL temporal como placeholder.
    // Cuando tengamos el endpoint de subida de archivos, se conecta aquí.

    const checklist: Checklist = {
      id: 0,
      fecha: this.formulario.get('fecha')?.value,
      placa: this.formulario.get('placa')?.value.toUpperCase(),
      movimiento: this.formulario.get('movimiento')?.value,
      rutaArchivo: `https://archivos.logistica.com/checklists/${this.archivoSeleccionado.name}`,
      nombreArchivo: this.archivoSeleccionado.name,
      fechaSubida: ''
    };

    this.checklistService.crear(checklist).subscribe({
      next: (data) => {
        this.mostrarMensaje('Documento registrado correctamente', 'exito');
        this.enviando = false;

        // Esperar un momento y volver a la lista
        setTimeout(() => {
          this.router.navigate(['/dashboard/checklist']);
        }, 1500);
      },
      error: (error) => {
        if (error.status === 401) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        }
        this.mostrarMensaje('Error al guardar el documento', 'error');
        this.enviando = false;
      }
    });
  }

  // Volver a la lista
  volver(): void {
    this.router.navigate(['/dashboard/checklist']);
  }

  // Mostrar mensaje
  mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }

  // Getters para facilitar la validacion en el HTML
  get f() {
    return this.formulario.controls;
  }
}