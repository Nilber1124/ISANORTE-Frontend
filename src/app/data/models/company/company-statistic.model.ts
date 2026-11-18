export interface CompanyStatisticRequest {
  valor: number;
  prefijo?: string | null;
  sufijo?: string | null;
  etiqueta: string;
  orden: number;
  activo: boolean;
}

export interface CompanyStatisticResponse extends CompanyStatisticRequest {
  id: string;
}
