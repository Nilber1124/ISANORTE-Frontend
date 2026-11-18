export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedAdministrator {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  tipo: 'Bearer';
  expiracion: string;
  usuario: AuthenticatedAdministrator;
}
