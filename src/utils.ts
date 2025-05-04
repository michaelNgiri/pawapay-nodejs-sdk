export function getBaseUrl(baseUrlInput: 'sandbox' | 'production' | string): string {
    if (baseUrlInput === 'sandbox') {
        return 'https://api.sandbox.pawapay.io';
    }
    if (baseUrlInput === 'production') {
        return 'https://api.pawapay.io';
    }
    // Basic check if it looks like a URL
    if (baseUrlInput.startsWith('http')) {
         return baseUrlInput.replace(/\/$/, ''); // Remove trailing slash if present
    }
    throw new Error('Invalid baseUrl provided. Use "sandbox", "production", or a full URL.');
}