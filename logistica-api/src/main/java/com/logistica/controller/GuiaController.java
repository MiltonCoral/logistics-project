package com.logistica.controller;

import com.logistica.dao.GuiaDao;
import com.logistica.model.Guia;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guias")
public class GuiaController {

    private final GuiaDao guiaDao;

    public GuiaController(GuiaDao guiaDao) {
        this.guiaDao = guiaDao;
    }

    /**
     * GET /api/guias
     * Listar TODAS las guías de TODOS los clientes
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping
    public List<Guia> listarTodasGuias() {
        return guiaDao.findAll();
    }

    /**
     * GET /api/guias/cliente/{idCliente}
     * Listar guías de un cliente específico (ej: CPTDC = id 1)
     * Requiere: Header Authorization con Bearer <token>
     * Response: [{ "id": 1, "numeroGuia": "G-001", "placa": "ABC-123",
     *             "nombreCliente": "CPTDC", ... }]
     */
    @GetMapping("/cliente/{idCliente}")
    public List<Guia> listarGuiasPorCliente(@PathVariable Long idCliente) {
        return guiaDao.findByClienteId(idCliente);
    }

    /**
     * GET /api/guias/{id}
     * Obtener una guía por su ID
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/{id}")
    public ResponseEntity<Guia> obtenerGuia(@PathVariable Long id) {
        Guia g = guiaDao.findById(id);
        if (g != null) {
            return ResponseEntity.ok(g);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/guias/cliente/{idCliente}/buscar?fecha=2024-06-15&numeroGuia=G-001&placa=ABC123
     * Buscar guías de un cliente por fecha, número de guía y/o placa
     * Query params opcionales: fecha, numeroGuia, placa
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/cliente/{idCliente}/buscar")
    public List<Guia> buscarGuiasPorCliente(
            @PathVariable Long idCliente,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String numeroGuia,
            @RequestParam(required = false) String placa) {
        return guiaDao.findByFiltro(idCliente, fecha, numeroGuia, placa);
    }

    /**
     * GET /api/guias/cliente/{idCliente}/exportar?fechaInicio=2024-06-01&fechaFin=2024-06-30
     * Obtener guías de un cliente por rango de fechas (para imprimir o descargar PDF)
     * Query params: fechaInicio, fechaFin (formato: yyyy-MM-dd)
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/cliente/{idCliente}/exportar")
    public List<Guia> exportarGuiasPorCliente(
            @PathVariable Long idCliente,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        return guiaDao.findByRangoFechas(idCliente, fechaInicio, fechaFin);
    }

    /**
     * POST /api/guias
     * Crear una nueva guía (subir documento escaneado de un viaje)
     * Requiere: Header Authorization con Bearer <token>
     * Body: { "idCliente": 1, "fecha": "2024-06-15", "numeroGuia": "G-001",
     *       "placa": "ABC-123", "motivoMovimiento": "Entrega de mercancía",
     *       "rutaArchivo": "https://r2.cloudflare.com/guia_001.pdf",
     *       "nombreArchivo": "guia_001.pdf" }
     */
    @PostMapping
    public ResponseEntity<Guia> crearGuia(@RequestBody Guia guia) {
        Guia nueva = guiaDao.save(guia);
        return ResponseEntity.ok(nueva);
    }

    /**
     * DELETE /api/guias/{id}
     * Eliminar una guía
     * Requiere: Header Authorization con Bearer <token>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarGuia(@PathVariable Long id) {
        guiaDao.deleteById(id);
        return ResponseEntity.ok().body("Guía eliminada correctamente");
    }
}
