import { useNavigate } from "@tanstack/react-router";
import { type FormEventHandler } from "react";
import { z } from "zod";

import { authClient } from "@/utils/authClient";

interface LoginAndSignUpFormProps {
  mode: 'sign-up' | 'sign-in';
}

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginAndSignUpForm = ({ mode }: LoginAndSignUpFormProps) => {
  const navigate = useNavigate({
    from: "/",
  });
  const isSignUp = mode === 'sign-up';

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formDataValue = Object.fromEntries(formData.entries());

    if (isSignUp) {
      const values = signUpSchema.parse(formDataValue)

      await authClient.signUp.email(
        {
          email: values.email,
          password: values.password,
          name: values.name,
        },
        {
          onSuccess: () => {
            console.log("Sign up successful");
            navigate({ to: "/" });
          },
          onError: (ctx) => {
            console.log(ctx.error.message);
          },
        },
      );
    } else {
      const values = signInSchema.parse(formDataValue)

      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onSuccess: () => {
            console.log("Sign in successful");
            navigate({ to: "/" });
          },
          onError: (ctx) => {
            console.log(ctx.error.message)
          },
        },
      );
    }
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