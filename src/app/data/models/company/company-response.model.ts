export interface SocialNetworkResponse {
  id: string;
  nombre: string;
  url: string;
  icono: string | null;
  orden: number | null;
  activo: boolean | null;
}

export interface CompanyResponse {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  telefonoSecundario: string | null;
  email: string | null;
  emailVentas: string | null;
  whatsapp: string | null;
  horarioAtencion: string | null;
  mision: string | null;
  vision: string | null;
  valores: string | null;
  resumenNosotros: string | null;
  redesSociales: SocialNetworkResponse[] | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
