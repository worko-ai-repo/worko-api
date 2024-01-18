export interface UserProvidedServiceDTO {}

export interface UserProvidedServiceDTOWithId extends UserProvidedServiceDTO {
  PK: string;
  SK: string;
}
