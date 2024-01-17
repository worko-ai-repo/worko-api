export interface UserBankDetailDTO {
  bankDetails: {
    bankName: string;
    holderName: string;
    ifscCode: string;
    accNumber: number;
    accType: string;
    status?: string;
    verifiedAt?: Date;
    timestamps?: {
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
  upiIds: {
    upiId: String;
    status?: string;
    verifiedAt?: Date;
    timestamps?: {
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
}
