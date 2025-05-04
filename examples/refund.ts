// examples/refund.ts
import PawaPayClient from '../src/index';
import dotenv from 'dotenv';
import { PawaPayRefundPayload } from '../src/types';

dotenv.config();

async function runRefundExample() {
  const apiKey = process.env.PAWAPAY_API_TOKEN;
  const environment = process.env.PAWAPAY_ENV as 'sandbox' | 'production' || 'sandbox';

  // !!! IMPORTANT: Replace with an ACTUAL depositId from a successful deposit in your sandbox !!!
  const depositIdToRefund = process.env.PAWAPAY_DEPOSIT_ID_TO_REFUND || 'replace-with-real-successful-deposit-id';

  if (!apiKey) {
    console.error("Error: PAWAPAY_API_TOKEN not found in .env file");
    return;
  }
   if (depositIdToRefund.startsWith('replace-with')) {
    console.error("Error: Please set PAWAPAY_DEPOSIT_ID_TO_REFUND in your .env file with a valid deposit ID");
    return;
  }


  const client = new PawaPayClient({
    apiToken: apiKey,
    baseUrl: environment,
  });

  const refundPayload: PawaPayRefundPayload = {
    // refundId: 'provide-one-or-let-sdk-generate', // Optional
    depositId: depositIdToRefund,
    // amount: "1.00", // Optional: specify partial amount, otherwise full refund is attempted
    metadata: [{fieldName: "refundReason", fieldValue: "sdk-test-refund"}]
  };

  console.log(`Attempting refund for deposit ${depositIdToRefund} in ${environment} environment...`);

  try {
     // NOTE: This call will likely fail until the method is fully implemented
    const response = await client.requestRefund(refundPayload);
    console.log('Refund Request Response:', response);
     if(response.status === 'REJECTED') {
        console.warn('Refund Rejected:', response.rejectionReason);
     } else {
        console.log(`Refund Status: ${response.status}`);
     }
  } catch (error) {
    console.error('Refund Failed:', error instanceof Error ? error.message : String(error));
  }
}

runRefundExample();