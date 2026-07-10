import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GuiaService } from '../../services/guia';
import { ClienteService } from '../../services/cliente';
import { AuthService } from '../../services/auth';
import { Guia } from '../..//checklist/models/guia.model';
import { Cliente } from '../../checklist/models/cliente.model';

@Component({
  selector: 'app-guia-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './guia-form.html',
  styleUrl: './guia-form.css'
})
export class GuiaFormComponent implements OnInit {

  // ID del cliente de la URL
  idCliente: number = 0;

  // Datos del cliente
  cliente: Cliente | null = null;

  // Formulario
  formulario: FormGroup;

  // Archivo
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';

  // Estados
  enviando: boolean = false;
  mensaje: string = '';
  tipoMensaje: string = '';

  // Tipos permitidos
  tiposPermitidos: string[] = ['application/pdf', 'image/jpeg', 'image/png'];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private guiaService: GuiaService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) {
    // Formulario con los campos de la tabla "guias"
    this.formulario = this.fb.group({
      fecha: ['', Validators.required],
      numeroGuia: ['', [Validators.required, Validators.maxLength(100)]],
      placa: ['', [Validators.required, Validators.maxLength(20)]],
      motivoMovimiento: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    // Obtener idCliente de la URL
    this.idCliente = Number(this.route.snapshot.paramMap.get('idCliente'));

    if (!this.idCliente || isNaN(this.idCliente)) {
      this.router.navigate(['/dashboard/guias']);
      return;
    }

    // Cargar datos del cliente para mostrar el nombre
    this.clienteService.obtenerPorId(this.idCliente).subscribe({
      next: (data) => {
        this.cliente = data;
      },
      error: () => {
        this.mostrarMensaje('Cliente no encontrado', 'error');
      }
    });

    // Fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    this.formulario.patchValue({ fecha: hoy });
  }

  // Cuando se selecciona un archivo
  onArchivoSeleccionado(event: any): void {
    const archivo: File = event.target.files[0];

    if (!archivo) {
      return;
    }

    // Validar tipo
    if (!this.tiposPermitidos.includes(archivo.type)) {
      this.mostrarMensaje('Solo se permite PDF, JPG o PNG', 'error');
      this.limpiarArchivo();
      return;
    }

    // Validar tamano (max 10MB)
    if (archivo.size > 10 * 1024 * 1024) {
      this.mostrarMensaje('El archivo no puede ser mayor a 10MB', 'error');
      this.limpiarArchivo();
      return;
    }

    this.archivoSeleccionado = archivo;
    this.nombreArchivo = archivo.name;
    this.mensaje = '';
  }

  // Quitar archivo
  limpiarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    const inputArchivo = document.getElementById('inputArchivo') as HTMLInputElement;
    if (inputArchivo) {
      inputArchivo.value = '';
    }
  }

  // Abrir selector de archivo (para no usar document en el HTML)
  abrirSelectorArchivo(): void {
    const inputArchivo = document.getElementById('inputArchivo') as HTMLInputElement;
    if (inputArchivo) {
      inputArchivo.click();
    }
  }

  // Enviar formulario
  submit(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      this.mostrarMensaje('Completa todos los campos obligatorios', 'error');
      return;
    }

    if (!this.archivoSeleccionado) {
      this.mostrarMensaje('Debes adjuntar el archivo escaneado', 'error');
      return;
    }

    this.enviando = true;
    this.mensaje = '';

    // Armo el objeto Guia segun el modelo del backend
    // El campo idCliente viene de la URL
    const guia: Guia = {
      id: 0,
      idCliente: this.idCliente,
      fecha: this.formulario.get('fecha')?.value,
      numeroGuia: this.formulario.get('numeroGuia')?.value.toUpperCase(),
      placa: this.formulario.get('placa')?.value.toUpperCase(),
      motivoMovimiento: this.formulario.get('motivoMovimiento')?.value,
      rutaArchivo: `https://archivos.logistica.com/guias/${this.idCliente}/${this.archivoSeleccionado.name}`,
      nombreArchivo: this.archivoSeleccionado.name,
      fechaSubida: ''
    };

    // POST /api/guias
    this.guiaService.crear(guia).subscribe({
      next: () => {
        this.mostrarMensaje('Guía registrada correctamente', 'exito');
        this.enviando = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard/guias/cliente', this.idCliente]);
        }, 1500);
      },
      error: (error) => {
        if (error.status === 401) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        }
        this.mostrarMensaje('Error al guardar la guía', 'error');
        this.enviando = false;
      }
    });
  }

  // Volver a la lista de guias del cliente
  volver(): void {
    this.router.navigate(['/dashboard/guias/cliente', this.idCliente]);
  }
   // Ir al panel de clientes
  irAGuias(): void {
    this.router.navigate(['/dashboard/guias']);
  }

  // Mostrar mensaje
  mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }

  // Getters para validacion en HTML
  get f() {
    return this.formulario.controls;
  }
}