export interface AddressRequest {
  alias?: string | null;
  calle: string;
  distrito: string;
  ciudad: string;
  referencia?: string | null;
  telefonoContacto: string;
  principal: boolean;
}

export interface AddressResponse {
  id: string;
  alias: string | null;
  calle: string;
  distrito: string;
  ciudad: string;
  referencia: string | null;
  telefonoContacto: string;
  principal: boolean;
}
