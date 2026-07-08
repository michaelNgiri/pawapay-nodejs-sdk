import PawaPayClient from '../src/index';
import dotenv from 'dotenv';
import { PawaPayDepositPayload } from '../src/types';

dotenv.config(); // Load .env file

async function runDepositExample() {
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

  const depositPayload: PawaPayDepositPayload = {
    // depositId: 'provide-one-or-let-sdk-generate', // Optional
    amount: "5.00", // Use string as per docs
    currency: "ZMW",
    payer: {
      type: "MMO",
      accountDetails: {
        phoneNumber: "260763456789", // Use a valid PawaPay sandbox number
        provider: "MTN_MOMO_ZMB", // Use a valid sandbox provider
      },
    },
    customerMessage: "SDK Test Deposit",
    metadata: [{ testId: "sdk-test-123" }],
  };

  console.log(`Attempting deposit in ${environment} environment...`);

  try {
    const response = await client.requestDeposit(depositPayload);
    console.log('Deposit Request Response:', response);

    if (response.status === 'REJECTED') {
      console.warn('Deposit Rejected:', response.failureReason);
      return;
    }

    console.log(`Deposit ${response.depositId} accepted, checking status...`);
    const status = await client.checkDepositStatus(response.depositId);
    console.log('Deposit Status:', status);
  } catch (error) {
    console.error('Deposit Failed:', error instanceof Error ? error.message : String(error));
  }
}

runDepositExample();
