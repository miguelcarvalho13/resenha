import { type FormEventHandler } from "react";

interface LoginAndSignUpFormProps {
  mode: 'sign-up' | 'sign-in';
}

export const LoginAndSignUpForm = ({ mode }: LoginAndSignUpFormProps) => {
  const isSignUp = mode === 'sign-up';

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      {isSignUp && (
        <label>
          Name:
          <input type='text' name='name' />
        </label>
      )}

      <label>
        Email:
        <input type='email' name='email' />
      </label>

      <label>
        Password:
        <input type='password' name='password' />
      </label>

      {isSignUp
        ? <button type='submit'>Sign up</button>
        : <button type='submit'>Sign in</button>}
    </form>
  )
}