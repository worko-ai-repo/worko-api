export interface MasterServiceDTO {
  code: string;
  name: string;
  isActive: boolean;
  details: string;
  serviceScope: string[];
}

export interface ServicePlanResponseDTO extends MasterServiceDTO {
  SK: string;
}
