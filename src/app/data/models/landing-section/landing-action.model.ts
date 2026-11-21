/**
 * Botón fijo de una sección de la landing (p. ej. «Ver proyectos»). Solo lectura: lleva a otra
 * página y su destino no cambia, así que el admin y el backend no permiten crearlo, editarlo ni borrarlo.
 */
export interface LandingActionResponse {
  id: string;
  texto: string;
  enlace: string;
  orden: number;
  activo: boolean;
}
