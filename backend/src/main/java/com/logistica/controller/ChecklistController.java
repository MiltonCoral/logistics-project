package com.logistica.controller;

import com.logistica.dao.ChecklistDao;
import com.logistica.model.Checklist;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklists")
public class ChecklistController {

    private final ChecklistDao checklistDao;

    public ChecklistController(ChecklistDao checklistDao) {
        this.checklistDao = checklistDao;
    }

    /**
     * GET /api/checklists
     * Listar todos los checklists (ordenados por fecha descendente)
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping
    public List<Checklist> listarChecklists() {
        return checklistDao.findAll();
    }

    /**
     * GET /api/checklists/{id}
     * Obtener un checklist por su ID
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/{id}")
    public ResponseEntity<Checklist> obtenerChecklist(@PathVariable Long id) {
        Checklist c = checklistDao.findById(id);
        if (c != null) {
            return ResponseEntity.ok(c);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/checklists/buscar?fecha=2024-06-15&placa=ABC123
     * Buscar checklists por fecha y/o placa (filtros)
     * Query params opcionales: fecha, placa
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/buscar")
    public List<Checklist> buscarChecklists(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String placa) {
        return checklistDao.findByFiltro(fecha, placa);
    }

    /**
     * GET /api/checklists/exportar?fechaInicio=2024-06-01&fechaFin=2024-06-30
     * Obtener checklists por rango de fechas (para imprimir o descargar PDF)
     * Query params: fechaInicio, fechaFin (formato: yyyy-MM-dd)
     * Requiere: Header Authorization con Bearer <token>
     */
    @GetMapping("/exportar")
    public List<Checklist> exportarChecklists(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        return checklistDao.findByRangoFechas(fechaInicio, fechaFin);
    }

    /**
     * POST /api/checklists
     * Crear un nuevo checklist (subir documento escaneado)
     * Requiere: Header Authorization con Bearer <token>
     * Body: { "fecha": "2024-06-15", "placa": "ABC-123", "movimiento": "Carga de cemento",
     *       "rutaArchivo": "https://r2.cloudflare.com/checklist_001.pdf",
     *       "nombreArchivo": "checklist_001.pdf" }
     */
    @PostMapping
    public ResponseEntity<Checklist> crearChecklist(@RequestBody Checklist checklist) {
        Checklist nuevo = checklistDao.save(checklist);
        return ResponseEntity.ok(nuevo);
    }

    /**
     * DELETE /api/checklists/{id}
     * Eliminar un checklist
     * Requiere: Header Authorization con Bearer <token>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarChecklist(@PathVariable Long id) {
        checklistDao.deleteById(id);
        return ResponseEntity.ok().body("Checklist eliminado correctamente");
    }
}
