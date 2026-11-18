import { DemoExperienceStatusEnum } from '../../../src/components/RosaHandsOn/DemoExperienceModels';
import { expect, test } from '../../fixtures/pages';
import {
  DemoExperienceApiPayload,
  ResolvedHandsOnExperience,
} from '../../page-objects/rosa-hands-on-page';
import { ROSA_HANDS_ON_ROUTE } from '../../support/playwright-constants';

const quota = (current: number, limit = 3) => ({ current, limit });

const payloads = {
  availableUnused: {
    status: DemoExperienceStatusEnum.Available,
    quota: quota(0),
  },
  availableRemaining: {
    status: DemoExperienceStatusEnum.Available,
    quota: quota(1),
  },
  unavailable: {
    status: DemoExperienceStatusEnum.Unavailable,
    quota: quota(0),
  },
  unauthorized: {
    status: DemoExperienceStatusEnum.Unavailable,
    unavailable_reason: 'unauthorized',
    quota: quota(0),
  },
  // API still returns unavailable; UI rewrites to quota-exceeded when current >= limit.
  quotaExceeded: {
    status: DemoExperienceStatusEnum.Unavailable,
    quota: quota(3),
  },
  failed: {
    status: DemoExperienceStatusEnum.Failed,
    quota: quota(1),
  },
  started: {
    status: DemoExperienceStatusEnum.Started,
    quota: quota(1),
    experience_url: 'https://example.com/rosa-hands-on',
    scheduled_delete_timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  deploying: {
    status: DemoExperienceStatusEnum.Deploying,
    quota: quota(1),
  },
} as const satisfies Record<string, DemoExperienceApiPayload>;

/**
 * Hands-on e2e (ROSAENG-75830)
 *
 * - @ci mocked suite: static chrome + mailto/CTA states (deterministic, no demo API dependency)
 * - @smoke live suite: adapts to whatever the environment's demo API returns
 * - @advanced mocked suite: started / deploying CTAs (covered lightly; deeper copy in unit tests)
 *
 * Does not click "Request experience" — side-effect free.
 */
test.describe.serial(
  'ROSA Hands-on Experience page — mocked mailto and chrome (ROSAENG-75830)',
  { tag: ['@ci', '@smoke', '@rosa'] },
  () => {
    test.beforeAll(async ({ navigateTo, rosaHandsOnPage }) => {
      await rosaHandsOnPage.mockDemoExperience(payloads.availableUnused);
      await navigateTo(ROSA_HANDS_ON_ROUTE);
      await rosaHandsOnPage.isRosaHandsOnPage();
    });

    test.afterAll(async ({ rosaHandsOnPage }) => {
      await rosaHandsOnPage.clearDemoExperienceMock();
    });

    test('renders page chrome, header Slack, Learn more, and recommended content links', async ({
      rosaHandsOnPage,
    }) => {
      await expect(rosaHandsOnPage.pageHeading()).toBeVisible();
      await rosaHandsOnPage.expectStaticChromeLinks();
    });

    test('available with unused quota — Request enabled, no alert mailto', async ({
      rosaHandsOnPage,
    }) => {
      const experience = await rosaHandsOnPage.reloadWithMockedExperience(payloads.availableUnused);
      expect(experience.status).toBe(DemoExperienceStatusEnum.Available);
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });

    test('available with launches remaining — alert mailto to customer success', async ({
      rosaHandsOnPage,
    }) => {
      const experience = await rosaHandsOnPage.reloadWithMockedExperience(
        payloads.availableRemaining,
      );
      expect(experience.remainingQuota).toBe(2);
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });

    test('unavailable — demo system alert, mailto, Request disabled', async ({
      rosaHandsOnPage,
    }) => {
      const experience = await rosaHandsOnPage.reloadWithMockedExperience(payloads.unavailable);
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });

    test('unavailable + unauthorized — business email copy, no alert mailto', async ({
      rosaHandsOnPage,
    }) => {
      const experience = await rosaHandsOnPage.reloadWithMockedExperience(payloads.unauthorized);
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });

    test('quota exceeded — Create a ROSA cluster CTA and mailto', async ({ rosaHandsOnPage }) => {
      const experience = await rosaHandsOnPage.reloadWithMockedExperience(payloads.quotaExceeded);
      expect(experience.status).toBe('quota-exceeded');
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });

    test('failed — error alert mailto and Request enabled', async ({ rosaHandsOnPage }) => {
      const experience = await rosaHandsOnPage.reloadWithMockedExperience(payloads.failed);
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });
  },
);

test.describe.serial(
  'ROSA Hands-on Experience page — live demo status (ROSAENG-75830)',
  { tag: ['@smoke', '@rosa'] },
  () => {
    let experience: ResolvedHandsOnExperience;

    test.beforeAll(async ({ navigateTo, rosaHandsOnPage }) => {
      await rosaHandsOnPage.clearDemoExperienceMock();
      const capturePromise = rosaHandsOnPage.captureDemoExperience();
      await navigateTo(ROSA_HANDS_ON_ROUTE);
      experience = await capturePromise;
      await rosaHandsOnPage.isRosaHandsOnPage();
    });

    test('adapts alert, CTA, and customer-success mailto to live demo status', async ({
      rosaHandsOnPage,
    }) => {
      test.info().annotations.push({
        type: 'demo-experience',
        description: `status=${experience.status} quota=${experience.quotaCurrent}/${experience.quotaLimit}${
          experience.unavailableReason ? ` reason=${experience.unavailableReason}` : ''
        }`,
      });
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });
  },
);

test.describe.serial(
  'ROSA Hands-on Experience page — mocked provisioning states (ROSAENG-75830)',
  { tag: ['@advanced', '@rosa'] },
  () => {
    test.beforeAll(async ({ navigateTo, rosaHandsOnPage }) => {
      await rosaHandsOnPage.mockDemoExperience(payloads.started);
      await navigateTo(ROSA_HANDS_ON_ROUTE);
      await rosaHandsOnPage.isRosaHandsOnPage();
    });

    test.afterAll(async ({ rosaHandsOnPage }) => {
      await rosaHandsOnPage.clearDemoExperienceMock();
    });

    test('started — Access experience CTA', async ({ rosaHandsOnPage }) => {
      const experience = await rosaHandsOnPage.reloadWithMockedExperience(payloads.started);
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });

    test('deploying — Provisioning cluster CTA', async ({ rosaHandsOnPage }) => {
      const experience = await rosaHandsOnPage.reloadWithMockedExperience(payloads.deploying);
      await rosaHandsOnPage.expectStatusSpecificUi(experience);
    });
  },
);
