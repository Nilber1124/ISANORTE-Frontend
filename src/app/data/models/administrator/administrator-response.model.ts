export interface AdministratorRoleSummary {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface AdministratorResponse {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  activo: boolean | null;
  ultimoAcceso: string | null;
  roles: AdministratorRoleSummary[] | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
