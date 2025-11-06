import { Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { LoginAndSignUpForm } from '@/components/auth/LoginAndSignUpForm';
import { LoginAndSignUpFormLayout } from '@/components/auth/LoginAndSignUpFormLayout';
import { LinkStyled } from '@/components/link/LinkStyled';

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
});

function SignIn() {
  const { t } = useTranslation();

  return (
    <LoginAndSignUpFormLayout
      form={<LoginAndSignUpForm mode="sign-in" />}
      extra={
        <Text>
          {t(($) => $.signInSignUp.notRegisteredYet)}{' '}
          <LinkStyled to="/sign-up">
            {' '}
            {t(($) => $.signInSignUp.signUp)}
          </LinkStyled>
        </Text>
      }
      title={
        <Text size="lg" fw="bold">
          {t(($) => $.signInSignUp.signIn)}
        </Text>
      }
    />
  );
}
