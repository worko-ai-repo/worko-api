export interface UserProvidedServiceDTO {
  masterServiceId: string;
  status: string;
  serviceScope: string[]; // Additional user scopes
  description: string; // Max length 256
  durationAndPrices: {
    priceId: string;
    durationInMinutes: number;
    rate: number;
    createdAt?: Date;
    updatedAt?: Date;
  }[];
}

export interface UserProvidedServiceUpdateDTO {
  masterServiceId: string;
  status: string;
  serviceScope: string[]; // Additional user scopes
  description: string; // Max length 256
  durationAndPrices: {
    priceId: string;
    durationInMinutes: number;
    rate: number;
    createdAt?: Date;
    updatedAt?: Date;
  }[];
}

export interface UserProvidedServiceViewDTO {
  views: {
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
