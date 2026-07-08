import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import PawaPayClient from './index';
import { PawaPayDepositPayload, PawaPayPayoutPayload, PawaPayRefundPayload } from './types';

vi.mock('axios', () => {
  const get = vi.fn();
  const post = vi.fn();
  const mockAxiosInstance = { get, post };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: vi.fn(),
    },
  };
});

const mockedAxios = axios as unknown as {
  create: ReturnType<typeof vi.fn>;
  isAxiosError: ReturnType<typeof vi.fn>;
};

function createClient() {
  return new PawaPayClient({ apiToken: 'test-token', baseUrl: 'sandbox' });
}

function axiosInstance() {
  return mockedAxios.create.mock.results[0].value as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
}

describe('PawaPayClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.isAxiosError.mockReturnValue(false);
  });

  it('throws when required config is missing', () => {
    expect(() => new PawaPayClient({ apiToken: '', baseUrl: 'sandbox' })).toThrow(
      'PawaPay configuration (apiToken, baseUrl) is required.'
    );
  });

  it('configures axios with the resolved base URL and bearer token', () => {
    createClient();
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://api.sandbox.pawapay.io',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
  });

  describe('deposits', () => {
    const payload: PawaPayDepositPayload = {
      amount: '5.00',
      currency: 'ZMW',
      payer: { type: 'MMO', accountDetails: { phoneNumber: '260763456789', provider: 'MTN_MOMO_ZMB' } },
    };

    it('generates a depositId when one is not provided', async () => {
      const client = createClient();
      axiosInstance().post.mockResolvedValue({ data: { depositId: 'server-id', status: 'ACCEPTED', created: 'now' } });

      await client.requestDeposit(payload);

      const [, body] = axiosInstance().post.mock.calls[0];
      expect(axiosInstance().post).toHaveBeenCalledWith('/v2/deposits', expect.any(Object));
      expect(body.depositId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('preserves a caller-provided depositId', async () => {
      const client = createClient();
      axiosInstance().post.mockResolvedValue({ data: { depositId: 'my-id', status: 'ACCEPTED', created: 'now' } });

      await client.requestDeposit({ ...payload, depositId: 'my-id' });

      const [, body] = axiosInstance().post.mock.calls[0];
      expect(body.depositId).toBe('my-id');
    });

    it('checks deposit status by ID', async () => {
      const client = createClient();
      axiosInstance().get.mockResolvedValue({ data: { status: 'FOUND', data: { depositId: 'my-id' } } });

      const result = await client.checkDepositStatus('my-id');

      expect(axiosInstance().get).toHaveBeenCalledWith('/v2/deposits/my-id');
      expect(result.status).toBe('FOUND');
    });
  });

  describe('payouts', () => {
    const payload: PawaPayPayoutPayload = {
      amount: '3.50',
      currency: 'ZMW',
      recipient: { type: 'MMO', accountDetails: { phoneNumber: '260771234567', provider: 'AIRTEL_OAPI_ZMB' } },
    };

    it('generates a payoutId when one is not provided', async () => {
      const client = createClient();
      axiosInstance().post.mockResolvedValue({ data: { payoutId: 'server-id', status: 'ACCEPTED', created: 'now' } });

      await client.requestPayout(payload);

      const [, body] = axiosInstance().post.mock.calls[0];
      expect(axiosInstance().post).toHaveBeenCalledWith('/v2/payouts', expect.any(Object));
      expect(body.payoutId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('checks payout status by ID', async () => {
      const client = createClient();
      axiosInstance().get.mockResolvedValue({ data: { status: 'FOUND', data: { payoutId: 'my-id' } } });

      await client.checkPayoutStatus('my-id');

      expect(axiosInstance().get).toHaveBeenCalledWith('/v2/payouts/my-id');
    });

    it('cancels an enqueued payout', async () => {
      const client = createClient();
      axiosInstance().post.mockResolvedValue({ data: { payoutId: 'my-id', status: 'ACCEPTED' } });

      await client.cancelEnqueuedPayout('my-id');

      expect(axiosInstance().post).toHaveBeenCalledWith('/v2/payouts/fail-enqueued/my-id');
    });
  });

  describe('refunds', () => {
    const payload: PawaPayRefundPayload = {
      depositId: 'deposit-id',
      amount: '1.00',
      currency: 'ZMW',
    };

    it('generates a refundId when one is not provided', async () => {
      const client = createClient();
      axiosInstance().post.mockResolvedValue({ data: { refundId: 'server-id', status: 'ACCEPTED', created: 'now' } });

      await client.requestRefund(payload);

      const [, body] = axiosInstance().post.mock.calls[0];
      expect(axiosInstance().post).toHaveBeenCalledWith('/v2/refunds', expect.any(Object));
      expect(body.refundId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('checks refund status by ID', async () => {
      const client = createClient();
      axiosInstance().get.mockResolvedValue({ data: { status: 'FOUND', data: { refundId: 'my-id' } } });

      await client.checkRefundStatus('my-id');

      expect(axiosInstance().get).toHaveBeenCalledWith('/v2/refunds/my-id');
    });
  });

  describe('toolkit', () => {
    it('predicts the provider for a phone number', async () => {
      const client = createClient();
      axiosInstance().post.mockResolvedValue({
        data: { country: 'ZMB', provider: 'MTN_MOMO_ZMB', phoneNumber: '260763456789' },
      });

      const result = await client.predictProvider('+260 763-456789');

      expect(axiosInstance().post).toHaveBeenCalledWith('/v2/predict-provider', { phoneNumber: '+260 763-456789' });
      expect(result.provider).toBe('MTN_MOMO_ZMB');
    });

    it('fetches active configuration with query params', async () => {
      const client = createClient();
      axiosInstance().get.mockResolvedValue({ data: { companyName: 'Acme', countries: [] } });

      await client.getActiveConfiguration({ country: 'ZMB', operationType: 'DEPOSIT' });

      expect(axiosInstance().get).toHaveBeenCalledWith('/v2/active-conf', {
        params: { country: 'ZMB', operationType: 'DEPOSIT' },
      });
    });

    it('fetches wallet balances filtered by country', async () => {
      const client = createClient();
      axiosInstance().get.mockResolvedValue({ data: { balances: [] } });

      await client.getWalletBalances('ZMB');

      expect(axiosInstance().get).toHaveBeenCalledWith('/v2/wallet-balances', { params: { country: 'ZMB' } });
    });
  });

  describe('error handling', () => {
    it('surfaces the PawaPay failureReason when present', async () => {
      const client = createClient();
      mockedAxios.isAxiosError.mockReturnValue(true);
      axiosInstance().post.mockRejectedValue({
        response: { status: 400, data: { failureReason: { code: 'INVALID_CURRENCY', message: 'bad currency' } } },
      });

      await expect(
        client.requestDeposit({
          amount: '5.00',
          currency: 'XXX',
          payer: { type: 'MMO', accountDetails: { phoneNumber: '260763456789', provider: 'MTN_MOMO_ZMB' } },
        })
      ).rejects.toThrow('PawaPay rejected (INVALID_CURRENCY): bad currency');
    });

    it('falls back to a generic message for non-axios errors', async () => {
      const client = createClient();
      mockedAxios.isAxiosError.mockReturnValue(false);
      axiosInstance().post.mockRejectedValue(new Error('network down'));

      await expect(
        client.requestDeposit({
          amount: '5.00',
          currency: 'ZMW',
          payer: { type: 'MMO', accountDetails: { phoneNumber: '260763456789', provider: 'MTN_MOMO_ZMB' } },
        })
      ).rejects.toThrow('An unknown error occurred during the PawaPay request: network down');
    });
  });
});
