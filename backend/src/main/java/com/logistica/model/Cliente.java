package com.logistica.model;

import java.time.LocalDateTime;

public class Cliente {
    private Long id;
    private String nombreCliente;
    private LocalDateTime fechaCreacion;

    public Cliente() {}
    public Cliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
