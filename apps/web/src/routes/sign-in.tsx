import { Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { LoginAndSignUpForm } from '@/components/auth/LoginAndSignUpForm';
import { LoginAndSignUpFormLayout } from '@/components/auth/LoginAndSignUpFormLayout';
import { LinkStyled } from '@/components/link/LinkStyled';

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
});

function SignIn() {
  return (
    <LoginAndSignUpFormLayout
      form={<LoginAndSignUpForm mode="sign-in" />}
      extra={
        <Text>
          Not registered yet? <LinkStyled to="/sign-up">Sign up</LinkStyled>
        </Text>
      }
      title={
        <Text size="lg" fw="bold">
          Sign-in
        </Text>
      }
    />
  );
}
