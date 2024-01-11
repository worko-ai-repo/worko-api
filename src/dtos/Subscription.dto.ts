export default interface SubscriptionDTO {
  amount: number;
  status: string;
  name: string;
  availableReferrals: number;
  acceptedReferrals: number;
  requestedReferrals: number;
  expiryDate: Date;
  purchaseDate: Date;
}
