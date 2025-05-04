import axios, { AxiosInstance, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PawaPayConfig, PawaPayDepositPayload, PawaPayDepositResponse, PawaPayPayoutPayload, PawaPayPayoutResponse, PawaPayRefundPayload, PawaPayRefundResponse } from './types';
import { getBaseUrl } from './utils';

export class PawaPayClient {
  private readonly apiToken: string;
  private readonly axiosInstance: AxiosInstance;

  constructor(config: PawaPayConfig) {
    if (!config || !config.apiToken || !config.baseUrl) {
      throw new Error('PawaPay configuration (apiToken, baseUrl) is required.');
    }
    this.apiToken = config.apiToken;
    const resolvedBaseUrl = getBaseUrl(config.baseUrl);

    this.axiosInstance = axios.create({
      baseURL: resolvedBaseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Requests a deposit payment.
   * @param payload - The deposit details. depositId and customerTimestamp are optional.
   * @returns Promise resolving with the PawaPay deposit response.
   */
  async requestDeposit(payload: PawaPayDepositPayload): Promise<PawaPayDepositResponse> {
    const depositData = {
      ...payload,
      depositId: payload.depositId || uuidv4(), // Generate UUID if not provided
      customerTimestamp: payload.customerTimestamp || new Date().toISOString(), // Generate timestamp
    };

    try {
      const response = await this.axiosInstance.post<PawaPayDepositResponse>('/deposits', depositData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Deposit Request Failed');
      // Note: handleApiError throws, so this line technically won't be reached,
      // but needed for type checking unless handleApiError has return type 'never'
      throw error;
    }
  }

  // --- Placeholder for future methods ---
  // async requestPayout(payload: PayoutPayload): Promise<PayoutResponse> {
  //   // Implementation later
  // }
  // async requestRefund(payload: RefundPayload): Promise<RefundResponse> {
  //    // Implementation later
  // }
  // --- End Placeholder ---


  private handleApiError(error: unknown, context: string): void {
      if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<any>; // Use 'any' or define a PawaPayErrorResponse type
          console.error(`PawaPay API Error (${context}): Status ${axiosError.response?.status}`, axiosError.response?.data || axiosError.message);
          // Extract specific PawaPay rejection reason if available
          const rejectionReason = axiosError.response?.data?.rejectionReason;
          const errorMessage = rejectionReason
              ? `PawaPay rejected (${rejectionReason.code}): ${rejectionReason.message}`
              : `PawaPay API request failed with status ${axiosError.response?.status}: ${JSON.stringify(axiosError.response?.data)}`;

          throw new Error(errorMessage);
      } else {
          console.error(`Unknown Error (${context}):`, error);
          throw new Error(`An unknown error occurred during the PawaPay request: ${error instanceof Error ? error.message : String(error)}`);
      }
  }




      /**
       * Requests a payout transfer. (Not Yet Implemented)
       * @param payload - The payout details. payoutId and customerTimestamp are optional.
       * @returns Promise resolving with the PawaPay payout response.
       */
      async requestPayout(payload: PawaPayPayoutPayload): Promise<PawaPayPayoutResponse> {
        // TODO: Implement actual API call logic
        console.warn("requestPayout is not fully implemented yet.");

        const payoutData = {
          ...payload,
          payoutId: payload.payoutId || uuidv4(),
          customerTimestamp: payload.customerTimestamp || new Date().toISOString(),
        };

        try {
          // Placeholder for the actual call structure
          const response = await this.axiosInstance.post<PawaPayPayoutResponse>('/payouts', payoutData);
          return response.data; // Return mock data or actual response if implemented
        } catch (error) {
          this.handleApiError(error, 'Payout Request Failed');
          throw error; // Re-throw after handling
        }
         // Temporary throw until implemented
         // throw new Error("requestPayout method not implemented.");
      }

      /**
       * Requests a refund for a previous deposit. (Not Yet Implemented)
       * @param payload - The refund details. refundId is optional. Amount is optional for full refund.
       * @returns Promise resolving with the PawaPay refund response.
       */
      async requestRefund(payload: PawaPayRefundPayload): Promise<PawaPayRefundResponse> {
        // TODO: Implement actual API call logic
        console.warn("requestRefund is not fully implemented yet.");

         const refundData = {
          ...payload,
          refundId: payload.refundId || uuidv4(),
        };

        try {
            // Placeholder for the actual call structure
            const response = await this.axiosInstance.post<PawaPayRefundResponse>('/refunds', refundData);
            return response.data; // Return mock data or actual response if implemented
        } catch (error) {
            this.handleApiError(error, 'Refund Request Failed');
            throw error; // Re-throw after handling
        }
        // Temporary throw until implemented
        // throw new Error("requestRefund method not implemented.");
      }
}

// Export the client class as the main export
export default PawaPayClient;