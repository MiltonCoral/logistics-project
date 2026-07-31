import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadFileResponse {
  fileName: string;
  fileDownloadUri: string;
  fileType: string;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private baseUrl = 'http://localhost:8080/api/files';

  constructor(private http: HttpClient) {}

  /** POST /api/files/upload — Subir un solo archivo */
  uploadFile(file: File): Observable<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadFileResponse>(`${this.baseUrl}/upload`, formData);
  }
}