export interface PawaPayConfig {
  apiToken: string;
  baseUrl: 'sandbox' | 'production' | string;
}

export interface PawaPayMetadataField {
  [key: string]: string | boolean | undefined;
  isPII?: boolean;
}

export type PawaPayFinalStatus = 'COMPLETED' | 'FAILED';
export type PawaPaySearchStatus = 'ACCEPTED' | 'PROCESSING' | 'IN_RECONCILIATION' | PawaPayFinalStatus;
export type PawaPayInitiationStatus = 'ACCEPTED' | 'REJECTED' | 'DUPLICATE_IGNORED';

export interface PawaPayFailureReason {
  failureCode: string;
  failureMessage: string;
}

export interface PawaPayMmoAccountDetails {
  phoneNumber: string; // MSISDN, digits only, no separators
  provider: string; // e.g. "MTN_MOMO_ZMB"
}

export interface PawaPayMmoParty {
  type: 'MMO';
  accountDetails: PawaPayMmoAccountDetails;
}

// --- Deposits ---

export interface PawaPayDepositPayload {
  depositId?: string; // Optional: SDK generates a UUIDv4 if omitted
  payer: PawaPayMmoParty;
  amount: string;
  currency: string; // ISO 4217, e.g. "ZMW"
  preAuthorisationCode?: string;
  clientReferenceId?: string;
  customerMessage?: string; // 4-22 chars, alphanumeric + spaces
  metadata?: PawaPayMetadataField[];
}

export interface PawaPayDepositResponse {
  depositId: string;
  status: PawaPayInitiationStatus;
  created: string;
  failureReason?: PawaPayFailureReason;
}

export interface PawaPayDepositDetails {
  depositId: string;
  status: PawaPaySearchStatus;
  amount: string;
  currency: string;
  country: string;
  payer: PawaPayMmoParty;
  customerMessage?: string;
  clientReferenceId?: string;
  created: string;
  providerTransactionId?: string;
  failureReason?: PawaPayFailureReason;
  metadata?: Record<string, string>;
}

export interface PawaPayDepositSearchResult {
  status: 'FOUND' | 'NOT_FOUND';
  data?: PawaPayDepositDetails;
}

// --- Payouts ---

export interface PawaPayPayoutPayload {
  payoutId?: string; // Optional: SDK generates a UUIDv4 if omitted
  recipient: PawaPayMmoParty;
  amount: string;
  currency: string;
  clientReferenceId?: string;
  customerMessage?: string;
  metadata?: PawaPayMetadataField[];
}

export interface PawaPayPayoutResponse {
  payoutId: string;
  status: PawaPayInitiationStatus;
  created: string;
  failureReason?: PawaPayFailureReason;
}

export type PawaPayPayoutSearchStatus = 'ACCEPTED' | 'ENQUEUED' | 'PROCESSING' | 'IN_RECONCILIATION' | PawaPayFinalStatus;

export interface PawaPayPayoutDetails {
  payoutId: string;
  status: PawaPayPayoutSearchStatus;
  amount: string;
  currency: string;
  country: string;
  recipient: PawaPayMmoParty;
  customerMessage?: string;
  clientReferenceId?: string;
  created: string;
  providerTransactionId?: string;
  failureReason?: PawaPayFailureReason;
  metadata?: Record<string, string>;
}

export interface PawaPayPayoutSearchResult {
  status: 'FOUND' | 'NOT_FOUND';
  data?: PawaPayPayoutDetails;
}

export interface PawaPayCancelEnqueuedPayoutResponse {
  payoutId: string;
  status: 'ACCEPTED' | 'REJECTED';
  failureReason?: PawaPayFailureReason;
}

// --- Refunds ---

export interface PawaPayRefundPayload {
  refundId?: string; // Optional: SDK generates a UUIDv4 if omitted
  depositId: string; // The depositId of the deposit to be refunded
  amount: string;
  currency: string;
  clientReferenceId?: string;
  metadata?: PawaPayMetadataField[];
}

export interface PawaPayRefundResponse {
  refundId: string;
  status: PawaPayInitiationStatus;
  created: string;
  failureReason?: PawaPayFailureReason;
}

export type PawaPayRefundSearchStatus = 'ACCEPTED' | 'ENQUEUED' | 'PROCESSING' | 'IN_RECONCILIATION' | PawaPayFinalStatus;

export interface PawaPayRefundDetails {
  refundId: string;
  status: PawaPayRefundSearchStatus;
  amount: string;
  currency: string;
  country: string;
  customerMessage?: string;
  clientReferenceId?: string;
  created: string;
  providerTransactionId?: string;
  failureReason?: PawaPayFailureReason;
  metadata?: Record<string, string>;
}

export interface PawaPayRefundSearchResult {
  status: 'FOUND' | 'NOT_FOUND';
  data?: PawaPayRefundDetails;
}

export interface PawaPayCancelEnqueuedRefundResponse {
  refundId: string;
  status: 'ACCEPTED' | 'REJECTED';
  failureReason?: PawaPayFailureReason;
}

// --- Toolkit ---

export type PawaPayOperationType = 'DEPOSIT' | 'PAYOUT' | 'REMITTANCE' | 'PUSH_DEPOSIT' | 'REFUND' | 'NAME_LOOKUP';

export interface PawaPayActiveConfigurationQuery {
  country?: string; // ISO 3166-1 alpha-3
  operationType?: PawaPayOperationType;
}

export interface PawaPayProviderConfiguration {
  provider: string;
  displayName: string;
  nameDisplayedToCustomer: string;
  logo: string;
  currencies: Record<string, unknown>;
}

export interface PawaPayCountryConfiguration {
  country: string; // ISO 3166-1 alpha-3
  displayName: { en: string; fr?: string; [locale: string]: string | undefined };
  prefix: string;
  flag: string;
  providers: PawaPayProviderConfiguration[];
}

export interface PawaPayActiveConfiguration {
  companyName: string;
  signatureConfiguration: {
    signedRequestsOnly: boolean;
    signedCallbacks: boolean;
  };
  countries: PawaPayCountryConfiguration[];
}

export interface PawaPayPredictProviderResponse {
  country: string;
  provider: string;
  phoneNumber: string;
}

export interface PawaPayWalletBalance {
  country: string;
  balance: string;
  currency: string;
  provider: string;
}

export interface PawaPayWalletBalancesResponse {
  balances: PawaPayWalletBalance[];
}
