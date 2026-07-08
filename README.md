# PawaPay Node.js SDK (Unofficial)

[![npm version](https://img.shields.io/npm/v/pawapay-nodejs-sdk.svg)](https://www.npmjs.com/package/pawapay-nodejs-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Downloads](https://img.shields.io/npm/dm/pawapay-nodejs-sdk.svg)](https://www.npmjs.com/package/pawapay-nodejs-sdk)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/pawapay-nodejs-sdk.svg)](https://bundlephobia.com/package/pawapay-nodejs-sdk)
[![TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)

A simple, typed Node.js client library for interacting with the [PawaPay Merchant API v2](https://docs.pawapay.io/v2/api-reference), making it easier to integrate mobile money payments (Deposits, Payouts, Refunds) into your applications.

> **Upgrading from 1.x?** See [Migrating from 1.x](#migrating-from-1x) — v2.0.0 targets pawaPay's current `/v2` API and is a breaking change.

## Motivation

When integrating PawaPay into various backend projects, I found there wasn't a readily available, developer-friendly Node.js library to simplify the process. Handling API specifics, request formatting, and response parsing directly can be time-consuming and repetitive.

This SDK aims to bridge that gap by providing a clean, intuitive, and type-safe wrapper around the core PawaPay API functionalities. The goal is to help developers integrate PawaPay quickly and reliably, focusing on their application logic rather than the intricacies of the raw API interaction.

## Features

* **Type-Safe:** Built with TypeScript for excellent developer experience, autocompletion, and compile-time checks.
* **Modern Async:** Uses `async/await` for clean asynchronous operations.
* **Targets the current pawaPay v2 API:**
  * Deposits: initiate, check status
  * Payouts: initiate, check status, cancel an enqueued payout
  * Refunds: initiate, check status, cancel an enqueued refund
  * Toolkit: predict the mobile money provider for a phone number, read your active configuration (countries/providers/currencies), read wallet balances
  * Planned: callbacks & bulk payouts
* **Automatic ID Generation:** Optionally generates UUIDv4s for `depositId`, `payoutId`, `refundId` if not provided.
* **Error Handling:** Parses pawaPay's `failureReason` for easier debugging.
* **Environment Support:** Easily configure for pawaPay `sandbox` or `production` environments.

## Installation

```bash
npm install pawapay-nodejs-sdk
# or
yarn add pawapay-nodejs-sdk
```

## Configuration

You need your PawaPay API Token and to specify the environment (`sandbox` or `production`).

**Security Warning:** NEVER hardcode your `apiToken` directly in your code. Use environment variables (e.g., via a `.env` file and the `dotenv` package) to keep your credentials secure.

Install `dotenv` (if you haven't already):

```bash
npm install dotenv
```

Create a `.env` file in your project root (add it to your `.gitignore`!):

```bash
# .env
PAWAPAY_API_TOKEN=your_sandbox_or_production_api_token_here
PAWAPAY_ENV=sandbox # or 'production'
```

Load environment variables at the start of your application:

```ts
import dotenv from 'dotenv';
dotenv.config();
```

## Usage

### 1. Import and Initialize Client

```ts
import PawaPayClient from 'pawapay-nodejs-sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.PAWAPAY_API_TOKEN;
const environment = (process.env.PAWAPAY_ENV as 'sandbox' | 'production') || 'sandbox';

if (!apiKey) {
  throw new Error('PAWAPAY_API_TOKEN not found in environment variables.');
}

const pawaPayClient = new PawaPayClient({
  apiToken: apiKey,
  baseUrl: environment, // Use 'sandbox' or 'production' shortcut
  // Or provide the full URL: baseUrl: 'https://api.sandbox.pawapay.io'
});
```

### 2. Requesting a Deposit

```ts
import { PawaPayDepositPayload } from 'pawapay-nodejs-sdk/dist/types';

async function makeDeposit() {
  const depositPayload: PawaPayDepositPayload = {
    // depositId: 'your-custom-uuid-v4', // Optional: SDK generates one if omitted
    amount: '5.00', // Amount as string
    currency: 'ZMW', // Zambian Kwacha example
    payer: {
      type: 'MMO',
      accountDetails: {
        phoneNumber: '260763456789', // Digits only, no separators
        provider: 'MTN_MOMO_ZMB', // Mobile money operator code
      },
    },
    customerMessage: 'SDK Deposit Test', // 4-22 chars, alphanumeric + spaces
    metadata: [{ orderId: 'sdk-order-123' }], // Optional
  };

  try {
    const response = await pawaPayClient.requestDeposit(depositPayload);

    if (response.status === 'ACCEPTED') {
      console.log(`Deposit ${response.depositId} accepted for processing.`);
      // Poll status or wait for a callback to see it move to COMPLETED/FAILED
      const status = await pawaPayClient.checkDepositStatus(response.depositId);
      console.log(status);
    } else if (response.status === 'REJECTED') {
      console.warn(`Deposit Rejected: ${response.failureReason?.failureCode} - ${response.failureReason?.failureMessage}`);
    }
  } catch (error) {
    console.error('Deposit Request Failed:', error instanceof Error ? error.message : String(error));
  }
}
```

### 3. Requesting a Payout

```ts
import { PawaPayPayoutPayload } from 'pawapay-nodejs-sdk/dist/types';

async function makePayout() {
  const payoutPayload: PawaPayPayoutPayload = {
    amount: '3.50',
    currency: 'ZMW',
    recipient: {
      type: 'MMO',
      accountDetails: {
        phoneNumber: '260771234567',
        provider: 'AIRTEL_OAPI_ZMB',
      },
    },
    customerMessage: 'SDK Payout Test',
    metadata: [{ payoutRef: 'sdk-payout-456' }],
  };

  const response = await pawaPayClient.requestPayout(payoutPayload);
  console.log(response.status); // 'ACCEPTED' | 'ENQUEUED' | 'REJECTED' | 'DUPLICATE_IGNORED'

  const status = await pawaPayClient.checkPayoutStatus(response.payoutId);
  console.log(status);

  // If it's still ENQUEUED and you need to stop it:
  // await pawaPayClient.cancelEnqueuedPayout(response.payoutId);
}
```

### 4. Requesting a Refund

```ts
import { PawaPayRefundPayload } from 'pawapay-nodejs-sdk/dist/types';

async function makeRefund() {
  const refundPayload: PawaPayRefundPayload = {
    depositId: 'an-existing-completed-deposit-id',
    amount: '1.00', // Partial or full refund amount
    currency: 'ZMW',
    metadata: [{ reason: 'Customer request (SDK Test)' }],
  };

  const response = await pawaPayClient.requestRefund(refundPayload);
  console.log(response.status);

  const status = await pawaPayClient.checkRefundStatus(response.refundId);
  console.log(status);
}
```

### 5. Toolkit: Predict Provider, Active Configuration, Wallet Balances

```ts
// Predict which mobile money operator a phone number belongs to
const prediction = await pawaPayClient.predictProvider('+260763456789');
console.log(prediction); // { country: 'ZMB', provider: 'MTN_MOMO_ZMB', phoneNumber: '260763456789' }

// See which countries/providers/currencies are active on your account
const activeConfiguration = await pawaPayClient.getActiveConfiguration({ country: 'ZMB', operationType: 'DEPOSIT' });

// Check your wallet balances
const balances = await pawaPayClient.getWalletBalances('ZMB');
```

See the [`examples/`](./examples) directory for complete, runnable scripts.

## Error Handling

Every client method returns a Promise that rejects if:

* There's a network error communicating with the pawaPay API.
* The pawaPay API returns a non-successful HTTP status code (e.g., 4xx, 5xx).

Use standard `try...catch` blocks to handle these errors. The thrown error's `message` includes pawaPay's `failureReason.failureCode`/`failureMessage` when available.

## Migrating from 1.x

pawaPay's Merchant API moved to `/v2`, and v1 is no longer documented. This SDK's `2.0.0` release follows that move, which changes several shapes from `1.x`:

| Area | 1.x | 2.x |
| --- | --- | --- |
| Deposit endpoint | `POST /deposits` | `POST /v2/deposits` |
| Payer/recipient | `{ type: "MSISDN", address: { value } }` | `{ type: "MMO", accountDetails: { phoneNumber, provider } }` |
| Correspondent field | `correspondent` | `accountDetails.provider` |
| Country field | `country` (required on request) | derived server-side; only present in status-check responses |
| Description field | `statementDescription` | `customerMessage` |
| Timestamp field | `customerTimestamp` (client-supplied) | removed; `created` comes from the server response only |
| Rejection details | `rejectionReason` | `failureReason` (`failureCode`/`failureMessage`) |
| Status checks | not available | `checkDepositStatus`, `checkPayoutStatus`, `checkRefundStatus` |

`requestPayout` and `requestRefund` are now fully implemented (in 1.x they called the API but were mislabeled as "not yet implemented").

## Contributing

Contributions are welcome! If you find a bug, have a feature request, or want to help with the planned callback/bulk-payout support, please feel free to:

* Open an issue on the GitHub repository.
* Fork the repository, make your changes, and submit a pull request.

Please ensure code follows the existing style and includes tests (`npm test`).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Disclaimer

This is an unofficial SDK developed independently and is not directly affiliated with or endorsed by PawaPay. Please refer to the [official PawaPay documentation](https://docs.pawapay.io/) for authoritative information.
