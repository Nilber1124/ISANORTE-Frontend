export interface AdministratorUpdateRequest {
  nombre: string;
  apellido?: string | null;
  email: string;
  telefono?: string | null;
  activo: boolean;
}
