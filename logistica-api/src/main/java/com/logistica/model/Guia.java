package com.logistica.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Guia {
    private Long id;
    private Long idCliente;            // Relación con tabla clientes
    private LocalDate fecha;
    private String numeroGuia;
    private String placa;
    private String motivoMovimiento;
    private String rutaArchivo;        // URL en la nube
    private String nombreArchivo;
    private LocalDateTime fechaSubida;

    // Campo extra para mostrar nombre del cliente en consultas
    private String nombreCliente;

    public Guia() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdCliente() { return idCliente; }
    public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getNumeroGuia() { return numeroGuia; }
    public void setNumeroGuia(String numeroGuia) { this.numeroGuia = numeroGuia; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getMotivoMovimiento() { return motivoMovimiento; }
    public void setMotivoMovimiento(String motivoMovimiento) { this.motivoMovimiento = motivoMovimiento; }

    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
}
