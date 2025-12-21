import supertest from 'supertest';
import { describe, expect } from 'vitest';

import type { GlobalConfig } from '@api/domain/globalConfig';
import { createAndSignInUser } from '@api/tests/sessionUtils';
import { DEFAULT_TEST_ENV_VARS, test } from '@api/tests/testExtend';

const defaultExpectation: GlobalConfig = {
  isEmailSignupEnabled: !!Number(
    DEFAULT_TEST_ENV_VARS.FEATURE_ENABLE_EMAIL_SIGNUP,
  ),
  isInviteCodesEnabled: !!Number(DEFAULT_TEST_ENV_VARS.FEATURE_ENABLE_INVITES),
};

describe('globalConfig.findAll', () => {
  test('should be correctly handled', async ({ app }) => {
    // Sign-up and sign-in just for the purpose of checking that accessing this
    // route with a session also works
    const { authCookie } = await createAndSignInUser(app!);

    const res = await supertest(app!)
      .get('/api/trpc/globalConfig.findAll')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.result.data.json).to.deep.equal({
      ...defaultExpectation,
    } satisfies GlobalConfig);
  });

  test('should be a public route', async ({ app }) => {
    const res = await supertest(app!).get('/api/trpc/globalConfig.findAll');

    expect(res.status).toBe(200);
  });
});

describe('FEATURE_ENABLE_EMAIL_SIGNUP=0', () => {
  test.scoped({
    env: {
      ...DEFAULT_TEST_ENV_VARS,
      FEATURE_ENABLE_EMAIL_SIGNUP: '0',
    },
  });

  test('globalConfig.findAll', async ({ app }) => {
    const res = await supertest(app!).get('/api/trpc/globalConfig.findAll');

    expect(res.status).toBe(200);
    expect(res.body.result.data.json).to.deep.equal({
      ...defaultExpectation,
      isEmailSignupEnabled: false,
    } satisfies GlobalConfig);
  });
});

describe('FEATURE_ENABLE_INVITES=1', () => {
  test.scoped({
    env: {
      ...DEFAULT_TEST_ENV_VARS,
      FEATURE_ENABLE_INVITES: '1',
    },
  });

  test('globalConfig.findAll', async ({ app }) => {
    const res = await supertest(app!).get('/api/trpc/globalConfig.findAll');

    expect(res.status).toBe(200);
    expect(res.body.result.data.json).to.deep.equal({
      ...defaultExpectation,
      isInviteCodesEnabled: true,
    } satisfies GlobalConfig);
  });
});
