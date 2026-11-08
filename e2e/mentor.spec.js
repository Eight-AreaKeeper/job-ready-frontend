import { test, expect } from '@playwright/test';
import { registerUI, watchErrors } from './helpers.js';

test('mentor card, coffee chat request, accept, complete, points', async ({ browser }) => {
  // Mentor signs up and fills in the card
  const mentorCtx = await browser.newContext();
  const mp = await mentorCtx.newPage();
  const mErr = watchErrors(mp);
  const mentorName = `Jordan Mentor ${Date.now() % 10000}`;
  await registerUI(mp, { name: mentorName, role: 'mentor' });
  await expect(mp).toHaveURL(/\/mentor\/signup/);
  await mp.getByLabel('Your role *').fill('Senior Data Engineer');
  await mp.getByLabel('Company or institution').fill('Prairie Data (fictional)');
  await mp.getByLabel('Years of experience').fill('11');
  await mp.getByRole('button', { name: 'Software' }).click();
  await mp.getByLabel(/Areas of expertise/).fill('Data pipelines');
  await mp.getByLabel(/Areas of expertise/).press('Enter');
  await mp.getByRole('button', { name: 'More' }).click();
  await mp.getByRole('button', { name: 'Submit' }).click();
  await expect(mp).toHaveURL(/\/mentor\/dashboard/);
  await expect(mp.getByRole('heading', { name: /Welcome back, Jordan/ })).toBeVisible();
  await expect(mp.getByText('Experience:')).toBeVisible();
  // Mentors get Dashboard in the menu instead of Mentors, and see their own card on it
  const nav = mp.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link')).toHaveText(['About us', 'Resume', 'Opportunities', 'Dashboard']);
  await expect(mp.getByRole('region', { name: 'My mentor profile' })).toContainText('Senior Data Engineer');
  await expect(mp.getByRole('link', { name: 'Edit my card' })).toBeVisible();
  await mp.goto('/mentors');
  await expect(mp.getByText('Finish up your mentor card')).toHaveCount(0);
  await mp.goto('/mentor/dashboard');
  await expect(mp.locator('.stat').first()).toContainText('0');

  // Mentors see Opportunities exactly as students do
  await mp.getByRole('link', { name: 'Opportunities' }).click();
  await expect(mp.getByRole('tab', { name: 'Browse all' })).toBeVisible();
  await expect(mp.getByRole('tab', { name: 'Recommended for you' })).toBeVisible();
  await expect(mp.getByRole('link', { name: /^Apply/ }).first()).toBeVisible();
  await mp.getByRole('link', { name: 'View details' }).first().click();
  await expect(mp.getByRole('link', { name: 'Apply', exact: true })).toBeVisible();
  await expect(mp.getByRole('link', { name: 'Practice an interview' })).toBeVisible();
  await mp.goto('/opportunities/recommended');
  await expect(mp).toHaveURL(/\/opportunities\/recommended/);
  await mp.goto('/mentor/dashboard');

  // Student finds the mentor and requests a chat with an AI-drafted message
  const studentCtx = await browser.newContext();
  const sp = await studentCtx.newPage();
  const sErr = watchErrors(sp);
  await registerUI(sp, { name: 'Leo Student', role: 'student' });
  await expect(sp).toHaveURL(/\/profile\/setup/);
  await sp.goto('/mentors');
  await sp.getByPlaceholder('Search by name, role or expertise').fill(mentorName);
  const card = sp.locator('article', { hasText: mentorName });
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('11 years');
  await card.getByRole('link', { name: 'Request a coffee chat' }).click();
  await expect(sp.getByLabel('Your message')).not.toHaveValue('', { timeout: 30_000 });
  await sp.locator('fieldset .chip').first().click();
  await sp.getByRole('button', { name: 'Send request' }).click();
  await expect(sp.getByText('Request sent.')).toBeVisible();
  await expect(sp.locator('.status.pending').first()).toBeVisible();

  // Mentor sees the request with the student's name, accepts it
  await mp.reload();
  await expect(mp.getByRole('heading', { name: 'New requests (1)' })).toBeVisible();
  await expect(mp.getByText('Leo Student', { exact: true })).toBeVisible();
  await mp.getByRole('button', { name: 'Accept' }).click();
  await expect(mp.getByRole('heading', { name: 'New requests (0)' })).toBeVisible();
  await expect(mp.locator('.status.accepted')).toBeVisible();

  // Student sees it accepted and marks it completed
  await sp.reload();
  await expect(sp.locator('.status.accepted')).toBeVisible();
  await sp.getByRole('button', { name: 'Mark as completed' }).click();
  await expect(sp.locator('.status.completed')).toBeVisible();

  // Mentor gets 10 points
  await mp.reload();
  await expect(mp.locator('.stat').first()).toContainText('10');
  await expect(mp.getByRole('heading', { name: 'Past chats' })).toBeVisible();

  mErr.check();
  sErr.check();
  await mentorCtx.close();
  await studentCtx.close();
});

test('declining a request', async ({ browser }) => {
  const mentorCtx = await browser.newContext();
  const mp = await mentorCtx.newPage();
  const name = `Decline Mentor ${Date.now() % 10000}`;
  await registerUI(mp, { name, role: 'mentor' });
  await mp.getByLabel('Your role *').fill('Product Manager');
  await mp.getByRole('button', { name: 'Submit' }).click();
  await expect(mp).toHaveURL(/\/mentor\/dashboard/);

  const sp = await (await browser.newContext()).newPage();
  await registerUI(sp, { name: 'Mia Student', role: 'student' });
  await expect(sp).toHaveURL(/\/profile\/setup/);
  await sp.goto('/mentors');
  await sp.getByPlaceholder('Search by name, role or expertise').fill(name);
  await sp.locator('article', { hasText: name }).getByRole('link', { name: 'Request a coffee chat' }).click();
  await expect(sp.getByLabel('Your message')).not.toHaveValue('', { timeout: 30_000 });
  await sp.getByRole('button', { name: 'Send request' }).click();
  await expect(sp.getByText('Request sent.')).toBeVisible();

  await mp.reload();
  await mp.getByRole('button', { name: 'Decline' }).click();
  await expect(mp.locator('.status.declined')).toBeVisible();
  await sp.reload();
  await expect(sp.locator('.status.declined')).toBeVisible();
});
