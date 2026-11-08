import { expect } from '@playwright/test';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** Registers through the UI and returns the email used. */
export async function registerUI(page, { name, role }) {
  const email = `${role}.${uid()}@e2e.jobready.dev`;
  await page.goto(`/signin?role=${role}`);
  await page.getByRole('button', { name: role === 'mentor' ? /^Mentor/ : /Student \/ job seeker/ }).click();
  await page.getByLabel('Your name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create account' }).last().click();
  return email;
}

export async function signInUI(page, email, password = 'password123') {
  await page.goto('/signin?tab=login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).last().click();
}

/** Fails the test on any uncaught page error. */
export function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return { check: () => expect(errors, 'page errors').toEqual([]) };
}
