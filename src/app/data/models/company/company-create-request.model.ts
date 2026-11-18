export interface SocialNetworkCreateRequest {
  nombre: string;
  url: string;
  icono?: string | null;
  orden?: number | null;
  activo?: boolean | null;
}

export interface CompanyCreateRequest {
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  direccion?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
  telefonoSecundario?: string | null;
  email?: string | null;
  emailVentas?: string | null;
  whatsapp?: string | null;
  horarioAtencion?: string | null;
  mision?: string | null;
  vision?: string | null;
  valores?: string | null;
  resumenNosotros?: string | null;
  redesSociales?: SocialNetworkCreateRequest[] | null;
}
