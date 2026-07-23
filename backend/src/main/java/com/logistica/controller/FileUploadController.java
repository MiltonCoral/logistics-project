package com.logistica.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.logistica.dto.UploadFileResponse;
import com.logistica.service.FileStorageService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Controller para subir, descargar y servir archivos locales.
 * Base URL: /api/files
 */
@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    private final FileStorageService fileStorageService;

    @Autowired
    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * POST /api/files/upload
     * Subir un solo archivo.
     * Requiere: Header Authorization con Bearer <token>
     * Form-data: key="file", value=<archivo>
     *
     * Response: {
     *   "fileName": "uuid.pdf",
     *   "fileDownloadUri": "http://localhost:8080/api/files/download/uuid.pdf",
     *   "fileType": "application/pdf",
     *   "size": 12345
     * }
     */
    @PostMapping("/upload")
    public UploadFileResponse uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/download/")
                .path(fileName)
                .toUriString();

        return new UploadFileResponse(fileName, fileDownloadUri, file.getContentType(), file.getSize());
    }

    /**
     * POST /api/files/upload-multiple
     * Subir múltiples archivos a la vez.
     * Requiere: Header Authorization con Bearer <token>
     * Form-data: key="files", value=<archivo1, archivo2, ...>
     */
    @PostMapping("/upload-multiple")
    public List<UploadFileResponse> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
        return Arrays.stream(files)
                .map(this::uploadFile)
                .collect(Collectors.toList());
    }

    /**
     * GET /api/files/download/{fileName}
     * Descargar o visualizar un archivo por su nombre.
     * Requiere: Header Authorization con Bearer <token>
     * El navegador decide si descargar o mostrar según el Content-Type.
     */
    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Determinar el tipo de contenido (MIME type)
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            logger.info("No se pudo determinar el tipo de archivo.");
        }

        // Fallback al tipo genérico de binario
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /**
     * GET /api/files/download/{fileName:.+}?attachment=true
     * Forzar descarga de archivo (Content-Disposition: attachment).
     */
    @GetMapping(value = "/download/{fileName:.+}", params = "attachment=true")
    public ResponseEntity<Resource> downloadFileAsAttachment(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            logger.info("No se pudo determinar el tipo de archivo.");
        }
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /**
     * DELETE /api/files/{fileName}
     * Eliminar un archivo del sistema de archivos local.
     * Requiere: Header Authorization con Bearer <token>
     */
    @DeleteMapping("/{fileName:.+}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        fileStorageService.deleteFile(fileName);
        return ResponseEntity.ok().body("Archivo eliminado correctamente: " + fileName);
    }
}