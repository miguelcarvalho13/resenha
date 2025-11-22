import { Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { LoginAndSignUpForm } from '@/components/auth/LoginAndSignUpForm';
import { LoginAndSignUpFormLayout } from '@/components/auth/LoginAndSignUpFormLayout';
import { LinkStyled } from '@/components/link/LinkStyled';

export const Route = createFileRoute('/_public/sign-up')({
  component: SignUp,
});

function SignUp() {
  const { t } = useTranslation();

  return (
    <LoginAndSignUpFormLayout
      form={<LoginAndSignUpForm mode="sign-up" />}
      extra={
        <Text>
          {t(($) => $.signInSignUp.alreadyRegistered)}{' '}
          <LinkStyled to="/sign-in">
            {t(($) => $.signInSignUp.signIn)}
          </LinkStyled>
        </Text>
      }
      title={
        <Text size="lg" fw="bold">
          {t(($) => $.signInSignUp.signUp)}
        </Text>
      }
    />
  );
}
