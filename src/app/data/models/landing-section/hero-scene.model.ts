export interface HeroSceneRequest {
  imagenUrl: string;
  alt?: string | null;
  orden: number;
  activo: boolean;
}

export interface HeroSceneResponse extends HeroSceneRequest {
  id: string;
}
