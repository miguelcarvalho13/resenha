import { createFileRoute, Link } from '@tanstack/react-router';

import { LoginAndSignUpForm } from '@/components/auth/LoginAndSignUpForm';

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
});

function SignIn() {
  return (
    <>
      <LoginAndSignUpForm mode='sign-in' />

      <p>
        Not registered yet? <Link to='/sign-up'>Sign up</Link>
      </p>
    </>
  );
}
