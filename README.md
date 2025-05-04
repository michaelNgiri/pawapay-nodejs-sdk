You need your PawaPay API Token and to specify the environment (sandbox or production).

⚠️ Security Warning: NEVER hardcode your apiToken directly in your code. Use environment variables (e.g., via a .env file and the dotenv package) to keep your credentials secure.

Install dotenv (if you haven't already):

npm install dotenv
# or
yarn add dotenv
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Create a .env file in your project root (add it to your .gitignore!):

# .env
PAWAPAY_API_TOKEN=your_sandbox_or_production_api_token_here
PAWAPAY_ENV=sandbox # or 'production'
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Env
IGNORE_WHEN_COPYING_END

Load environment variables at the start of your application:

import dotenv from 'dotenv';
dotenv.config();
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END
Usage
1. Import and Initialize Client
import PawaPayClient from 'pawapay-nodejs-sdk'; // Or: const PawaPayClient = require('pawapay-nodejs-sdk').default;
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const apiKey = process.env.PAWAPAY_API_TOKEN;
const environment = process.env.PAWAPAY_ENV as 'sandbox' | 'production' || 'sandbox'; // Default to sandbox

if (!apiKey) {
  throw new Error("PAWAPAY_API_TOKEN not found in environment variables.");
}

const pawaPayClient = new PawaPayClient({
  apiToken: apiKey,
  baseUrl: environment, // Use 'sandbox' or 'production' shortcut
  // Or provide the full URL: baseUrl: 'https://api.sandbox.pawapay.io'
});
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END
2. Requesting a Deposit (✅ Implemented)
import { PawaPayDepositPayload } from 'pawapay-nodejs-sdk/dist/types'; // Import specific types if needed

async function makeDeposit() {
  const depositPayload: PawaPayDepositPayload = {
    // depositId: 'your-custom-uuid-v4', // Optional: SDK generates if omitted
    amount: "5.00", // Amount as string
    currency: "ZMW", // Zambia Kwacha example
    country: "ZMB",   // Zambia alpha-3 code example
    correspondent: "MTN_MOMO_ZMB", // Specific mobile money operator code
    payer: {
      type: "MSISDN",
      address: {
        value: "260763456789", // Payer's phone number (use valid sandbox number)
      },
    },
    statementDescription: "SDK Deposit Test", // 4-22 characters
    // customerTimestamp: new Date().toISOString(), // Optional: SDK generates if omitted
    metadata: [{ fieldName: "orderId", fieldValue: "sdk-order-123" }] // Optional
  };

  console.log(`Attempting deposit in ${environment} environment...`);

  try {
    const response = await pawaPayClient.requestDeposit(depositPayload);
    console.log('Deposit Request Successful:', response);
    // response object structure: { depositId: string, status: 'ACCEPTED' | ..., created: string, rejectionReason?: ... }

    if (response.status === 'ACCEPTED') {
      console.log(`Deposit ${response.depositId} accepted for processing.`);
      // You would typically store the depositId and wait for a callback or poll status later
    } else if (response.status === 'REJECTED') {
      console.warn(`Deposit Rejected: ${response.rejectionReason?.code} - ${response.rejectionReason?.message}`);
    } else {
      console.log(`Deposit Status: ${response.status}`);
    }

  } catch (error) {
    console.error('Deposit Request Failed:', error instanceof Error ? error.message : String(error));
    // Error message often contains details from PawaPay if available
  }
}

makeDeposit();
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END
3. Requesting a Payout (⏳ Planned Feature - Not Yet Implemented)
import { PawaPayPayoutPayload } from 'pawapay-nodejs-sdk/dist/types';

async function makePayout() {
  // --- THIS FUNCTIONALITY IS PLANNED ---
  console.warn("Payout functionality is not yet implemented in this SDK version.");

  const payoutPayload: PawaPayPayoutPayload = {
    // payoutId: 'your-custom-uuid-v4', // Optional
    amount: "3.50",
    currency: "ZMW",
    country: "ZMB",
    correspondent: "AIRTEL_OAPI_ZMB", // Example correspondent
    recipient: {
      type: "MSISDN",
      address: {
        value: "26077xxxxxxx", // Recipient's phone number
      },
    },
    statementDescription: "SDK Payout Test",
    // customerTimestamp: new Date().toISOString(), // Optional
    metadata: [{ fieldName: "payoutRef", fieldValue: "sdk-payout-456" }] // Optional
  };

  console.log(`Attempting payout in ${environment} environment...`);

  try {
    // const response = await pawaPayClient.requestPayout(payoutPayload); // Uncomment when implemented
    // console.log('Payout Request Response:', response);
    // Handle response status ('ACCEPTED', 'ENQUEUED', 'REJECTED', 'DUPLICATE_IGNORED')
  } catch (error) {
     console.error('Payout Request Failed:', error instanceof Error ? error.message : String(error));
  }
}

// makePayout(); // Call when implemented
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END
4. Requesting a Refund (⏳ Planned Feature - Not Yet Implemented)
import { PawaPayRefundPayload } from 'pawapay-nodejs-sdk/dist/types';

async function makeRefund() {
  // --- THIS FUNCTIONALITY IS PLANNED ---
  console.warn("Refund functionality is not yet implemented in this SDK version.");

  // !!! IMPORTANT: Replace with an ACTUAL depositId from a successful deposit in your sandbox !!!
  const depositIdToRefund = process.env.PAWAPAY_DEPOSIT_ID_TO_REFUND || 'replace-with-real-successful-deposit-id';

  if (depositIdToRefund.startsWith('replace-with')) {
    console.error("Error: Please set PAWAPAY_DEPOSIT_ID_TO_REFUND in your .env file with a valid deposit ID for testing refunds.");
    return;
  }

  const refundPayload: PawaPayRefundPayload = {
    // refundId: 'your-custom-uuid-v4', // Optional
    depositId: depositIdToRefund,
    // amount: "1.00", // Optional: Omit for full refund, specify for partial
    metadata: [{ fieldName: "reason", fieldValue: "Customer request (SDK Test)" }] // Optional
  };

  console.log(`Attempting refund for deposit ${depositIdToRefund} in ${environment} environment...`);

  try {
    // const response = await pawaPayClient.requestRefund(refundPayload); // Uncomment when implemented
    // console.log('Refund Request Response:', response);
    // Handle response status ('ACCEPTED', 'REJECTED', 'DUPLICATE_IGNORED')
  } catch (error) {
    console.error('Refund Request Failed:', error instanceof Error ? error.message : String(error));
  }
}

// makeRefund(); // Call when implemented
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END
Error Handling

The SDK methods (requestDeposit, requestPayout, requestRefund) return Promises that will reject if:

There's a network error communicating with the PawaPay API.

The PawaPay API returns a non-successful HTTP status code (e.g., 4xx, 5xx).

Use standard try...catch blocks to handle these errors. The error thrown by the SDK will attempt to include details from the PawaPay response when available (like status code and rejection reasons).

Contributing

Contributions are welcome! If you find a bug, have a feature request, or want to contribute code (especially for the planned Payout/Refund features!), please feel free to:

Open an issue on the GitHub repository.

Fork the repository, make your changes, and submit a pull request.

Please ensure code follows existing style and includes tests where appropriate (tests are also a planned addition!).

License

This project is licensed under the MIT License. See the LICENSE file for details.

Disclaimer

This is an unofficial SDK developed independently and is not directly affiliated with or endorsed by PawaPay. Please refer to the official PawaPay documentation for authoritative information.