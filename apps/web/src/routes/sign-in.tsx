import { type FormEventHandler } from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
});

function SignIn() {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type='email' name='email' />
        </label>

        <label>
          Password:
          <input type='password' name='password' />
        </label>

        <button type='submit'>Sign in</button>
      </form>

      <p>
        Not registered yet? <Link to='/sign-up'>Sign up</Link>
      </p>
    </>
  );
}
