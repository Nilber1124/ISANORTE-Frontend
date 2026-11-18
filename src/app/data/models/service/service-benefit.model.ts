export interface ServiceBenefitRequest {
  texto: string;
  orden: number;
  activo: boolean;
}

export interface ServiceBenefitResponse extends ServiceBenefitRequest {
  id: string;
}
