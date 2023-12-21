export interface MasterServiceDTO {
  name: string;
  isActive: boolean;
  details: string;
}

export interface ServicePlanResponseDTO extends MasterServiceDTO {
  SK: string;
}
