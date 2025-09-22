import { Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { LoginAndSignUpForm } from '@/components/auth/LoginAndSignUpForm';
import { LoginAndSignUpFormLayout } from '@/components/auth/LoginAndSignUpFormLayout';
import { LinkStyled } from '@/components/link/LinkStyled';

export const Route = createFileRoute('/sign-up')({
  component: SignUp,
});

function SignUp() {
  return (
    <LoginAndSignUpFormLayout
      form={<LoginAndSignUpForm mode='sign-up' />}
      extra={
        <Text>
          Already registered? <LinkStyled to='/sign-in'>Sign in</LinkStyled>
        </Text>
      }
      title={<Text size='lg' fw="bold">Sign-up</Text>}
    />
  );
}
