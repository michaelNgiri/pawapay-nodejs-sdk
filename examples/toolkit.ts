// examples/toolkit.ts
import PawaPayClient from '../src/index';
import dotenv from 'dotenv';

dotenv.config();

async function runToolkitExample() {
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

  const prediction = await client.predictProvider("+260763456789");
  console.log('Predicted provider:', prediction);

  const activeConfiguration = await client.getActiveConfiguration({ country: 'ZMB', operationType: 'DEPOSIT' });
  console.log('Active configuration:', activeConfiguration);

  const balances = await client.getWalletBalances('ZMB');
  console.log('Wallet balances:', balances);
}

runToolkitExample();
