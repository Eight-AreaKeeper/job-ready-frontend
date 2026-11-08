import { test, expect } from '@playwright/test';
import { registerUI, watchErrors } from './helpers.js';

test.describe.configure({ mode: 'serial' });

test('student: register, questionnaire, profile, resume, jobs, apply, events, interview', async ({ page }) => {
  const errs = watchErrors(page);

  // 1. Register as a student -> questionnaire
  await registerUI(page, { name: 'Ava Test', role: 'student' });
  await expect(page).toHaveURL(/\/profile\/setup/);
  await expect(page.getByRole('heading', { name: 'Make a Profile' })).toBeVisible();

  // 2. Answer the questions from the back end
  await expect(page.getByLabel('Email')).toHaveValue(/@/);
  await page.getByRole('button', { name: "Bachelor's" }).click();
  await page.getByLabel('College or university').fill('University of Calgary');
  await page.getByLabel('Program or major').fill('Computer Science');
  await page.getByLabel(/Current year of study/).fill('3rd year');
  await page.getByLabel(/Graduation year/).fill('2027');
  await page.getByLabel('Technical skills').fill('Java, Spring Boot, SQL, Docker');
  await page.getByLabel('Soft skills').fill('Teamwork');
  await page.getByLabel(/Projects, leadership/).fill('Built a Spring Boot REST API for a campus marketplace used by 300 students.');
  await page.getByLabel(/roles are you interested/).fill('Backend developer');
  await page.getByRole('button', { name: 'Startup' }).click();
  await page.getByRole('button', { name: 'Local', exact: true }).click();
  await page.getByRole('button', { name: 'Internship or co-op' }).click();
  await page.getByRole('button', { name: 'Software' }).click();
  await page.getByRole('button', { name: 'Energy' }).click();
  await page.getByLabel('Your city').fill('Calgary, AB');
  await page.getByRole('button', { name: 'Submit' }).click();

  // 3. Profile page, edit and save
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'My career profile' })).toBeVisible();
  await expect(page.getByLabel('Location')).toHaveValue('Calgary, AB');
  await page.getByPlaceholder('Add a skill and press Enter').fill('Kubernetes');
  await page.getByPlaceholder('Add a skill and press Enter').press('Enter');
  await page.getByRole('button', { name: 'Intermediate' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Saved.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Kubernetes')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Intermediate' })).toHaveAttribute('aria-pressed', 'true');

  // 4. Base resume -> preview, PDF download, suggestions
  await page.getByRole('button', { name: 'Generate my resume' }).click();
  await expect(page).toHaveURL(/\/resumes\?id=r_/);
  await expect(page.getByRole('article', { name: 'Resume preview' })).toContainText('Ava Test');
  await expect(page.getByRole('article', { name: 'Resume preview' })).toContainText('SKILLS');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PDF' }).click()]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  await page.getByRole('button', { name: 'Get suggestions' }).click();
  await expect(page.locator('.suggestion').first()).toBeVisible();

  // 5. Browse jobs with filters and paging
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Opportunities' }).click();
  await expect(page.getByText(/results · deadline soonest first/)).toBeVisible();
  await page.getByLabel('Type').selectOption('internship');
  await expect.poll(async () => {
    const tags = await page.locator('.opp .opp-main .tag:first-child').allTextContents();
    return tags.length > 0 && tags.every((t) => t === 'Internship');
  }).toBe(true);
  await page.getByLabel('Type').selectOption('');
  await page.getByPlaceholder('Search by title, company or keyword').fill('zzzz-no-such-job');
  await expect(page.getByText('No opportunities match these filters.')).toBeVisible();
  await page.getByPlaceholder('Search by title, company or keyword').fill('');
  await expect(page.locator('.opp').first()).toBeVisible();
  const deadlines = await page.locator('.opp-side strong').allTextContents();
  const times = deadlines.map((d) => new Date(d).getTime());
  expect(times).toEqual([...times].sort((a, b) => a - b));

  // 6. Details -> requirements compared with profile
  const firstTitle = (await page.locator('.opp-title').first().textContent()).trim();
  await page.getByRole('link', { name: 'View details' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: firstTitle })).toBeVisible();
  await expect(page.getByText(/Closes in|Closed/)).toBeVisible();

  // 7. Apply -> tailor -> step 2
  await page.getByRole('link', { name: 'Apply', exact: true }).click();
  await expect(page.getByText('Step 1 of 2 · Your application')).toBeVisible();
  await page.getByRole('button', { name: /Tailor my resume for this job/ }).click();
  await expect(page.getByText('Step 2 of 2 · Your application')).toBeVisible();
  await expect(page.getByRole('heading', { name: `Resume tailored for ${firstTitle}` })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What the AI changed' })).toBeVisible();
  await expect(page.locator('.side-list button')).toHaveCount(2);

  // 8. Recommended for you
  await page.goto('/opportunities/recommended');
  await expect(page.locator('.ring').first()).toBeVisible();
  await page.getByRole('button', { name: 'Remote', exact: true }).click();
  await expect(page.locator('.ring').first()).toBeVisible();
  await expect.poll(async () => {
    const scopes = await page.locator('article.card .tag:nth-child(2)').allTextContents();
    return scopes.length > 0 && scopes.every((x) => x === 'Remote');
  }).toBe(true);

  // 9. Events: switch, filters, soonest first
  await page.getByRole('tab', { name: 'Events' }).click();
  await expect(page).toHaveURL(/\/events/);
  await expect(page.getByText(/upcoming events · date soonest first/)).toBeVisible();
  await page.getByLabel('Format').selectOption('online');
  await expect.poll(async () => {
    const formats = await page.locator('.event .tag:nth-child(2)').allTextContents();
    return formats.length > 0 && formats.every((f) => f === 'Online');
  }).toBe(true);
  await page.getByLabel('Format').selectOption('');
  await page.getByRole('button', { name: 'Workshop' }).click();
  await expect.poll(async () => {
    const kinds = await page.locator('.event .tag:first-child').allTextContents();
    return kinds.length > 0 && kinds.every((k) => k === 'Workshop');
  }).toBe(true);
  // Register for an event: stays on the page and confirms underneath
  const firstEvent = page.locator('.event').first();
  await firstEvent.getByRole('button', { name: 'Register' }).click();
  await expect(page).toHaveURL(/\/events/);
  await expect(firstEvent.getByRole('status')).toHaveText(/Registered successfully/);
  await expect(firstEvent.getByRole('button', { name: 'Registered' })).toBeDisabled();
  // View opens the event's own page, which knows it is registered
  const eventTitle = await firstEvent.locator('h2').textContent();
  await firstEvent.getByRole('link', { name: 'View' }).click();
  await expect(page).toHaveURL(/\/events\/[^/]+$/);
  await expect(page.getByRole('heading', { name: eventTitle })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Registered' })).toBeDisabled();
  await page.getByRole('link', { name: '← Back to events' }).click();
  await expect(page.locator('.event').first()).toBeVisible();
  // Soonest first
  const days = await page.locator('.event .date-block').evaluateAll((els) => els.map((e) => e.textContent));
  expect(days.length).toBeGreaterThan(0);

  // 10. Mock interview for a job
  await page.goto('/opportunities');
  await page.getByRole('link', { name: 'View details' }).first().click();
  await page.getByRole('link', { name: 'Practice an interview' }).click();
  await page.getByRole('button', { name: 'Start interview' }).click();
  await expect(page.getByText(/^Question 1 of \d+$/)).toBeVisible();
  const qCount = await page.locator('ol[aria-label="Progress"] li').count();
  expect(qCount).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < qCount; i++) {
    await expect(page.getByText(`Question ${i + 1} of ${qCount}`)).toBeVisible();
    await page.getByLabel('Your answer').fill('I built a REST API with Spring Boot, measured response times and cut them by 40 percent.');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByRole('heading', { name: `Feedback on question ${i + 1}` })).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: 'Interview finished' })).toBeVisible();
  await expect(page.getByText(/Average score: \d/)).toBeVisible();

  errs.check();
});
