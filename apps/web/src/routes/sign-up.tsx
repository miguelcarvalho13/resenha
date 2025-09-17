import { createFileRoute, Link } from '@tanstack/react-router';

import { LoginAndSignUpForm } from '@/components/auth/LoginAndSignUpForm';

export const Route = createFileRoute('/sign-up')({
  component: SignUp,
});

function SignUp() {
  return (
    <>
      <LoginAndSignUpForm mode='sign-up' />

      <p>
        Already registered? <Link to='/sign-in'>Sign in</Link>
      </p>
    </>
  );
}
