// examples/payout.ts
import PawaPayClient from '../src/index';
import dotenv from 'dotenv';
import { PawaPayPayoutPayload } from '../src/types';

dotenv.config();

async function runPayoutExample() {
  const apiKey = process.env.PAWAPAY_API_TOKEN;
  const environment = process.env.PAWAPAY_ENV as 'sandbox' | 'production' || 'sandbox';

  if (!apiKey) {
    console.error("Error: PAWAPAY_API_TOKEN not found in .env file");
    return;
  }

  const client = new PawaPayClient({
    apiToken: apiKey,
    baseUrl: environment,
  });

  const payoutPayload: PawaPayPayoutPayload = {
    // payoutId: 'provide-one-or-let-sdk-generate', // Optional
    amount: "3.50", // Example amount
    currency: "ZMW",
    recipient: {
      type: "MMO",
      accountDetails: {
        phoneNumber: "260771234567", // Use a different valid PawaPay sandbox number
        provider: "AIRTEL_OAPI_ZMB", // Use a valid sandbox provider
      },
    },
    customerMessage: "SDK Test Payout",
    metadata: [{ payoutRef: "po-sdk-456" }],
  };

  console.log(`Attempting payout in ${environment} environment...`);

  try {
    const response = await client.requestPayout(payoutPayload);
    console.log('Payout Request Response:', response);

    if (response.status === 'REJECTED') {
      console.warn('Payout Rejected:', response.failureReason);
      return;
    }

    console.log(`Payout ${response.payoutId} accepted, checking status...`);
    const status = await client.checkPayoutStatus(response.payoutId);
    console.log('Payout Status:', status);
  } catch (error) {
    console.error('Payout Failed:', error instanceof Error ? error.message : String(error));
  }
}

runPayoutExample();
