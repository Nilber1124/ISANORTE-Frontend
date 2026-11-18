export interface CompanyUpdateRequest {
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
}
