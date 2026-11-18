export interface ClienteRegistroRequest {
  nombre: string;
  apellido?: string | null;
  email: string;
  password: string;
  telefono?: string | null;
  aceptaTratamientoDatos: boolean;
}

export interface ClienteLoginRequest {
  email: string;
  password: string;
}

export interface ClienteResponse {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  fechaCreacion: string;
}

export interface ClienteAuthResponse {
  token: string;
  tipo: 'Bearer';
  expiracion: string;
  cliente: ClienteResponse;
}

/** Ítem del carrito tal como lo guarda el backend (contrato de CarritoItemDto). */
export interface CarritoClienteItem {
  productoSlug: string;
  productoNombre: string;
  productoSku: string;
  imagenUrl: string | null;
  imagenAlt: string | null;
  variante: { sku: string; nombre: string; precio: number | null } | null;
  cantidad: number;
  precioUnitario: number | null;
}

export interface CarritoClienteRequest {
  items: CarritoClienteItem[];
}

export interface CarritoClienteResponse {
  items: CarritoClienteItem[];
}
