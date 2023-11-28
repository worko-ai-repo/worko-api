export interface WorkoDTO {
  PK: String;
  SK: String;
}

export interface WorkoDTOWithGSI extends WorkoDTO {
  GSI1PK: String;
  GSI1SK: String;
}
