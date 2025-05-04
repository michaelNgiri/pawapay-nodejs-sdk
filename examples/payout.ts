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
    country: "ZMB",
    correspondent: "AIRTEL_OAPI_ZMB", // Use a valid sandbox correspondent
    recipient: {
      type: "MSISDN",
      address: {
        value: "26077xxxxxxx", // Use a different valid PawaPay sandbox number
      },
    },
    statementDescription: "SDK Test Payout",
    // customerTimestamp: new Date().toISOString(), // Optional
    metadata: [{fieldName: "payoutRef", fieldValue: "po-sdk-456"}]
  };

  console.log(`Attempting payout in ${environment} environment...`);

  try {
    // NOTE: This call will likely fail until the method is fully implemented
    const response = await client.requestPayout(payoutPayload);
    console.log('Payout Request Response:', response);
     if(response.status === 'REJECTED') {
        console.warn('Payout Rejected:', response.rejectionReason);
     } else {
        console.log(`Payout Status: ${response.status}`);
     }
  } catch (error) {
    console.error('Payout Failed:', error instanceof Error ? error.message : String(error));
  }
}

runPayoutExample();