import axios, { AxiosInstance, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  PawaPayConfig,
  PawaPayDepositPayload,
  PawaPayDepositResponse,
  PawaPayDepositSearchResult,
  PawaPayPayoutPayload,
  PawaPayPayoutResponse,
  PawaPayPayoutSearchResult,
  PawaPayCancelEnqueuedPayoutResponse,
  PawaPayRefundPayload,
  PawaPayRefundResponse,
  PawaPayRefundSearchResult,
  PawaPayCancelEnqueuedRefundResponse,
  PawaPayActiveConfiguration,
  PawaPayActiveConfigurationQuery,
  PawaPayPredictProviderResponse,
  PawaPayWalletBalancesResponse,
} from './types';
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

  // --- Deposits ---

  /**
   * Initiates a deposit (collecting a payment from a customer).
   * @param payload - The deposit details. depositId is optional; the SDK generates a UUIDv4 if omitted.
   */
  async requestDeposit(payload: PawaPayDepositPayload): Promise<PawaPayDepositResponse> {
    const depositData = {
      ...payload,
      depositId: payload.depositId || uuidv4(),
    };

    try {
      const response = await this.axiosInstance.post<PawaPayDepositResponse>('/v2/deposits', depositData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Deposit Request Failed');
    }
  }

  /** Checks the current status of a previously initiated deposit. */
  async checkDepositStatus(depositId: string): Promise<PawaPayDepositSearchResult> {
    try {
      const response = await this.axiosInstance.get<PawaPayDepositSearchResult>(`/v2/deposits/${depositId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Deposit Status Check Failed');
    }
  }

  // --- Payouts ---

  /**
   * Initiates a payout (sending money to a customer).
   * @param payload - The payout details. payoutId is optional; the SDK generates a UUIDv4 if omitted.
   */
  async requestPayout(payload: PawaPayPayoutPayload): Promise<PawaPayPayoutResponse> {
    const payoutData = {
      ...payload,
      payoutId: payload.payoutId || uuidv4(),
    };

    try {
      const response = await this.axiosInstance.post<PawaPayPayoutResponse>('/v2/payouts', payoutData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Payout Request Failed');
    }
  }

  /** Checks the current status of a previously initiated payout. */
  async checkPayoutStatus(payoutId: string): Promise<PawaPayPayoutSearchResult> {
    try {
      const response = await this.axiosInstance.get<PawaPayPayoutSearchResult>(`/v2/payouts/${payoutId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Payout Status Check Failed');
    }
  }

  /** Cancels a payout that is still in the ENQUEUED state. */
  async cancelEnqueuedPayout(payoutId: string): Promise<PawaPayCancelEnqueuedPayoutResponse> {
    try {
      const response = await this.axiosInstance.post<PawaPayCancelEnqueuedPayoutResponse>(
        `/v2/payouts/fail-enqueued/${payoutId}`
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Cancel Enqueued Payout Failed');
    }
  }

  // --- Refunds ---

  /**
   * Initiates a refund for a previous deposit.
   * @param payload - The refund details. refundId is optional; the SDK generates a UUIDv4 if omitted.
   */
  async requestRefund(payload: PawaPayRefundPayload): Promise<PawaPayRefundResponse> {
    const refundData = {
      ...payload,
      refundId: payload.refundId || uuidv4(),
    };

    try {
      const response = await this.axiosInstance.post<PawaPayRefundResponse>('/v2/refunds', refundData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Refund Request Failed');
    }
  }

  /** Checks the current status of a previously initiated refund. */
  async checkRefundStatus(refundId: string): Promise<PawaPayRefundSearchResult> {
    try {
      const response = await this.axiosInstance.get<PawaPayRefundSearchResult>(`/v2/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Refund Status Check Failed');
    }
  }

  /** Cancels a refund that is still in the ENQUEUED state. */
  async cancelEnqueuedRefund(refundId: string): Promise<PawaPayCancelEnqueuedRefundResponse> {
    try {
      const response = await this.axiosInstance.post<PawaPayCancelEnqueuedRefundResponse>(
        `/v2/refunds/fail-enqueued/${refundId}`
      );
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Cancel Enqueued Refund Failed');
    }
  }

  // --- Toolkit ---

  /** Retrieves the countries, providers, and currencies active on your account. */
  async getActiveConfiguration(query?: PawaPayActiveConfigurationQuery): Promise<PawaPayActiveConfiguration> {
    try {
      const response = await this.axiosInstance.get<PawaPayActiveConfiguration>('/v2/active-conf', {
        params: query,
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Active Configuration Request Failed');
    }
  }

  /** Predicts the mobile money provider for a given phone number (including country code). */
  async predictProvider(phoneNumber: string): Promise<PawaPayPredictProviderResponse> {
    try {
      const response = await this.axiosInstance.post<PawaPayPredictProviderResponse>('/v2/predict-provider', {
        phoneNumber,
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Predict Provider Request Failed');
    }
  }

  /** Retrieves your account's wallet balances, optionally filtered by country. */
  async getWalletBalances(country?: string): Promise<PawaPayWalletBalancesResponse> {
    try {
      const response = await this.axiosInstance.get<PawaPayWalletBalancesResponse>('/v2/wallet-balances', {
        params: country ? { country } : undefined,
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Wallet Balances Request Failed');
    }
  }

  private handleApiError(error: unknown, context: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ failureReason?: { code: string; message: string } }>;
      const failureReason = axiosError.response?.data?.failureReason;
      const errorMessage = failureReason
        ? `PawaPay rejected (${failureReason.code}): ${failureReason.message}`
        : `PawaPay API request failed with status ${axiosError.response?.status}: ${JSON.stringify(axiosError.response?.data)}`;

      throw new Error(errorMessage);
    }

    throw new Error(`An unknown error occurred during the PawaPay request: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Export the client class as the main export
export default PawaPayClient;
