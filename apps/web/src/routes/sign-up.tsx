import { type FormEventHandler } from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/sign-up')({
  component: SignUp,
});

function SignUp() {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type='text' name='name' />
        </label>

        <label>
          Email:
          <input type='email' name='email' />
        </label>

        <label>
          Password:
          <input type='password' name='password' />
        </label>

        <button type='submit'>Sign up</button>
      </form>

      <p>
        Already registered? <Link to='/sign-in'>Sign in</Link>
      </p>
    </>
  );
}
