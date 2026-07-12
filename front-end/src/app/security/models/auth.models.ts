export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  nombre?: string;
  rol?: string;
  message?: string;
}

export interface UsuarioAuth {
  nombre: string;
  rol: 'GERENTE' | 'ASISTENTE';
}