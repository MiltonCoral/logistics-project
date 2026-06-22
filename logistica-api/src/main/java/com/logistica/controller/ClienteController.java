package com.logistica.controller;

import com.logistica.dao.ClienteDao;
import com.logistica.model.Cliente;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<Cliente> crearCliente(@RequestBody Cliente cliente) {
        Cliente nuevo = clienteDao.save(cliente);
        return ResponseEntity.ok(nuevo);
    }

    /**
     * DELETE /api/clientes/{id}
     * Eliminar un cliente (y todas sus guías por CASCADE)
     * Requiere: Header Authorization con Bearer <token>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Long id) {
        clienteDao.deleteById(id);
        return ResponseEntity.ok().body("Cliente eliminado correctamente");
    }
}
