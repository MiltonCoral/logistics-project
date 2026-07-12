package com.logistica.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logistica.dao.ClienteDao;
import com.logistica.model.Cliente;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteDao clienteDao;

    public ClienteController(ClienteDao clienteDao) {
        this.clienteDao = clienteDao;
    }

    /**
     * GET /api/clientes
     * Listar todos los clientes (CPTDC, GRUPO ATLAS, etc.)
     * Requiere: Header Authorization con Bearer <token>
     * Response: [{ "id": 1, "nombreCliente": "CPTDC", "fechaCreacion": "2024-01-15T10:00:00" }]
     */
    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteDao.findAll();
    }

    /**
     * GET /api/clientes/{id}
     * Obtener un cliente por su ID
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtenerCliente(@PathVariable Long id) {
        Cliente cliente = clienteDao.findById(id);
        if (cliente != null) {
            return ResponseEntity.ok(cliente);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * POST /api/clientes
     * Crear un nuevo cliente (añadir empresa nueva)
     * Requiere: Header Authorization con Bearer <token>
     * Body: { "nombreCliente": "NUEVO CLIENTE S.A." }
     * Response: { "id": 5, "nombreCliente": "NUEVO CLIENTE S.A.", ... }
     */
    @PostMapping
    public ResponseEntity<String> crearCliente(@RequestBody Cliente cliente) {
    String mensaje = clienteDao.save(cliente);
    return ResponseEntity.ok(mensaje);
    }

    /**
     * DELETE /api/clientes/{id}
     * Eliminar un cliente (y todas sus guías por CASCADE)
     * Requiere: Header Authorization con Bearer <token>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarCliente(@PathVariable Long id) {
        String mensaje = clienteDao.deleteById(id);
        return ResponseEntity.ok(mensaje);
    }
}
