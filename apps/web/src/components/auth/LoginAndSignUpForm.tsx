import { Button, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { authClient } from '@/utils/authClient';

interface LoginAndSignUpFormProps {
  mode: 'sign-up' | 'sign-in';
}

export const signUpSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters' }),
  email: z.email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { error: 'Password must be at least 6 characters' }),
});

export const signInSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { error: 'Password must be at least 6 characters' }),
});

export const LoginAndSignUpForm = ({ mode }: LoginAndSignUpFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate({
    from: '/',
  });

  const isSignUp = mode === 'sign-up';
  const schema = isSignUp ? signUpSchema : signInSchema;

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      ...(isSignUp ? { name: '' } : {}),
      password: '',
    },

    validate: zod4Resolver(schema),
  });

  const handleSubmit = async (
    values: z.infer<typeof signInSchema> | z.infer<typeof signUpSchema>,
  ) => {
    if (isSignUp) {
      await authClient.signUp.email(
        {
          email: values.email,
          password: values.password,
          name: 'name' in values ? values.name : '',
        },
        {
          onSuccess: () => {
            console.log('Sign up successful');
            navigate({ to: '/' });
          },
          onError: (ctx) => {
            console.log(ctx.error.message);
          },
        },
      );
    } else {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onSuccess: () => {
            console.log('Sign in successful');
            navigate({ to: '/' });
          },
          onError: (ctx) => {
            console.log(ctx.error.message);
          },
        },
      );
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Stack>
        {isSignUp && (
          <TextInput
            label={t(($) => $.signInSignUp.fields.name)}
            placeholder={t(($) => $.signInSignUp.fields.name)}
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
        )}

        <TextInput
          label={t(($) => $.signInSignUp.fields.email)}
          placeholder={t(($) => $.signInSignUp.fields.email)}
          key={form.key('email')}
          type="email"
          {...form.getInputProps('email')}
        />

        <TextInput
          label={t(($) => $.signInSignUp.fields.password)}
          placeholder={t(($) => $.signInSignUp.fields.password)}
          key={form.key('password')}
          type="password"
          {...form.getInputProps('password')}
        />

        {isSignUp ? (
          <Button type="submit">{t(($) => $.signInSignUp.signUp)}</Button>
        ) : (
          <Button type="submit">{t(($) => $.signInSignUp.signIn)}</Button>
        )}
      </Stack>
    </form>
  );
};
