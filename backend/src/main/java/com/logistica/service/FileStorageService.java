package com.logistica.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

/**
 * Servicio para almacenar y recuperar archivos del sistema de archivos local.
 *
 * Configuración interna: lee file.upload-dir de application.properties
 * via @Value, sin necesidad de clase FileStorageConfig separada.
 *
 * Incluye excepciones internas:
 * - FileStorageException: Error al guardar/eliminar archivos
 * - MyFileNotFoundException: Archivo no encontrado (HTTP 404)
 */
@Service
public class FileStorageService {

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURACIÓN INTERNA (antes era FileStorageConfig.java)
    // ═══════════════════════════════════════════════════════════════

    @Value("${file.upload-dir:files}")
    private String uploadDir;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();
        try {
            Files.createDirectories(fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("No se pudo crear el directorio de archivos: " + fileStorageLocation, ex);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // MÉTODOS DE NEGOCIO
    // ═══════════════════════════════════════════════════════════════

    /**
     * Almacena un archivo en el sistema de archivos local.
     * Genera un nombre único (UUID) para evitar colisiones.
     */
    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Nombre de archivo inválido: " + originalFileName);
            }

            String fileExtension = "";
            int lastDot = originalFileName.lastIndexOf('.');
            if (lastDot > 0) {
                fileExtension = originalFileName.substring(lastDot);
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFileName;

        } catch (IOException ex) {
            throw new FileStorageException("No se pudo almacenar el archivo \"" + originalFileName + "\". Intente de nuevo.", ex);
        }
    }

    /**
     * Carga un archivo como recurso para descargar/visualizar.
     */
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new MyFileNotFoundException("Archivo no encontrado: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new MyFileNotFoundException("Archivo no encontrado: " + fileName, ex);
        }
    }

    /**
     * Elimina un archivo del sistema de archivos.
     */
    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new FileStorageException("No se pudo eliminar el archivo: " + fileName, ex);
        }
    }

    /**
     * Obtiene la ruta absoluta del directorio de almacenamiento.
     */
    public Path getFileStorageLocation() {
        return fileStorageLocation;
    }

    // ═══════════════════════════════════════════════════════════════
    // EXCEPCIONES INTERNAS (no necesitas archivos separados)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Error al guardar o eliminar un archivo.
     */
    public static class FileStorageException extends RuntimeException {
        public FileStorageException(String message) {
            super(message);
        }
        public FileStorageException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * Archivo no encontrado. Devuelve HTTP 404 automáticamente.
     */
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class MyFileNotFoundException extends RuntimeException {
        public MyFileNotFoundException(String message) {
            super(message);
        }
        public MyFileNotFoundException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}