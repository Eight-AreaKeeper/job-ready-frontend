import { test, expect } from '@playwright/test';
import { signInUI, watchErrors } from './helpers.js';

test('public pages render with the four-item navigation', async ({ page }) => {
  const errs = watchErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Make your career ambitions/ })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link')).toHaveText(['About us', 'Resume', 'Opportunities', 'Mentors']);
  await nav.getByRole('link', { name: 'About us' }).click();
  await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();
  await nav.getByRole('link', { name: 'Resume' }).click();
  await expect(page.getByRole('heading', { name: 'Generate a Job Specific Resume' })).toBeVisible();
  errs.check();
});

test('private pages send signed-out users to sign in', async ({ page }) => {
  await page.goto('/opportunities');
  await expect(page).toHaveURL(/\/signin\?next=/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});

test('wrong password shows an error; test student signs in to recommendations', async ({ page }) => {
  await signInUI(page, 'maya.chen@test.jobready.dev', 'wrong-password');
  await expect(page.getByRole('alert')).toHaveText('Wrong email or password.');
  await signInUI(page, 'maya.chen@test.jobready.dev');
  await expect(page).toHaveURL(/\/opportunities\/recommended/);
  await expect(page.locator('.ring').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'My profile' })).toContainText('Maya');
});
