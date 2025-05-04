export interface PawaPayConfig {
    apiToken: string;
    baseUrl: 'sandbox' | 'production' | string; 
  }
  
  export interface PawaPayDepositPayload {
    depositId?: string; // Optional: SDK will generate if missing
    amount: string;
    currency: string; // e.g., "ZMW"
    country: string;  // e.g., "ZMB"
    correspondent: string; // e.g., "MTN_MOMO_ZMB"
    payer: {
      type: "MSISDN";
      address: {
        value: string; // Phone number
      };
    };
    customerTimestamp?: string; // Optional: SDK can generate if missing
    statementDescription: string; // 4-22 chars
    metadata?: { fieldName: string; fieldValue: string; isPII?: boolean }[];
    // Add other optional fields from docs if needed: preAuthorisationCode
  }
  
  // Define interfaces for PawaPay API responses based on docs
  export interface PawaPayDepositResponse {
    depositId: string;
    status: 'ACCEPTED' | 'REJECTED' | 'DUPLICATE_IGNORED';
    created: string;
    rejectionReason?: {
       code: string;
       message: string;
    };
  }
  
//  --- Payout ---
  export interface PawaPayPayoutPayload {
    payoutId?: string; // Optional: SDK will generate if missing
    amount: string;
    currency: string; // e.g., "ZMW"
    country: string;  // e.g., "ZMB"
    correspondent: string; // e.g., "MTN_MOMO_ZMB"
    recipient: {
      type: "MSISDN";
      address: {
        value: string; // Phone number
      };
    };
    customerTimestamp?: string; // Optional: SDK can generate if missing
    statementDescription: string; // 4-22 chars
    metadata?: { fieldName: string; fieldValue: string; isPII?: boolean }[];
  }
  
  export interface PawaPayPayoutResponse {
    payoutId: string;
    status: 'ACCEPTED' | 'ENQUEUED' | 'REJECTED' | 'DUPLICATE_IGNORED';
    created: string;
    rejectionReason?: {
       code: string;
       message: string;
    };
  }

  // --- Refund ---
export interface PawaPayRefundPayload {
    refundId?: string; // Optional: SDK will generate if missing
    depositId: string; // The ID of the original deposit to refund
    amount?: string;   // Optional: If omitted, refunds the full deposit amount
    metadata?: { fieldName: string; fieldValue: string; isPII?: boolean }[];
  }
  
  export interface PawaPayRefundResponse {
    refundId: string;
    status: 'ACCEPTED' | 'REJECTED' | 'DUPLICATE_IGNORED';
    created: string;
    rejectionReason?: {
       code: string;
       message: string;
    };
  }
  