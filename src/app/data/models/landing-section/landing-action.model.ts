export interface LandingActionRequest {
  texto: string;
  enlace: string;
  orden: number;
  activo: boolean;
}

export interface LandingActionResponse extends LandingActionRequest {
  id: string;
}
