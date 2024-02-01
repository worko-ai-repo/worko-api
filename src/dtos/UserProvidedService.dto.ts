export interface UserProvidedServiceDTO {
  masterServiceId: string;
  status: string; // Should be 'active'
  serviceScope: string[]; // Additional user scopes
  description: string; // Max length 256
  durationAndPrices: {
    priceId: string;
    durationInMinutes: number;
    rate: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  views?: {
    id: string;
    viewerUserId: string;
    ipAddress: string;
    createdAt?: Date;
  }[];
}

export interface UserProvidedServiceDTOWithId extends UserProvidedServiceDTO {
  PK: string;
  SK: string;
}
