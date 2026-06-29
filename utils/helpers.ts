import { Page } from '@playwright/test';

export async function waitForToast(page: Page, expectedText?: string): Promise<void> {
  const toast = page.locator('.alert, .toast, .notification').first();
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  if (expectedText) {
    await toast.filter({ hasText: expectedText }).waitFor({ state: 'visible' });
  }
}

export function generateEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}+${timestamp}@example.com`;
}

export function generateUniqueString(prefix = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}`;
}

export async function retryAction<T>(
  action: () => Promise<T>,
  retries = 3,
  delayMs = 500,
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await action();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error('retryAction exhausted');
}
