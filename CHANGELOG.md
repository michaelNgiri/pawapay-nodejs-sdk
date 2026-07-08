# Changelog

All notable changes to this project are documented in this file.

## 2.0.0

### Breaking changes

pawaPay's Merchant API moved to `/v2`; this release follows that move. See the [Migrating from 1.x](./README.md#migrating-from-1x) section of the README for the full field-by-field diff. Highlights:

- All requests now target `/v2/...` endpoints instead of `/...`.
- `payer`/`recipient` shape changed from `{ type: "MSISDN", address: { value } }` to `{ type: "MMO", accountDetails: { phoneNumber, provider } }`.
- `correspondent` was replaced by `accountDetails.provider`.
- `statementDescription` was renamed to `customerMessage`.
- `customerTimestamp` was removed (the server-assigned `created` timestamp is authoritative).
- `rejectionReason` was renamed to `failureReason` (`failureCode`/`failureMessage`).
- Refunds now require `currency` and `amount` on the request.

### Added

- `checkDepositStatus`, `checkPayoutStatus`, `checkRefundStatus` for polling transaction status.
- `cancelEnqueuedPayout` and `cancelEnqueuedRefund`.
- `predictProvider` to resolve the mobile money operator for a phone number.
- `getActiveConfiguration` to read the countries/providers/currencies enabled on your account.
- `getWalletBalances` to read account balances.
- A vitest test suite covering the client and `getBaseUrl`.

### Fixed

- `requestPayout` and `requestRefund` are fully implemented; previously they called the API but were mislabeled in the README as "not yet implemented."

### Changed

- Updated `axios`, `typescript`, `dotenv`, and `@types/*` to their latest compatible versions.

## 1.0.3 and earlier

Initial releases targeting an earlier pawaPay API shape (deposits fully implemented; payout/refund scaffolding present but undocumented).
