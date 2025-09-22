import { Center, Paper, Stack } from "@mantine/core";
import { type ReactNode } from "react"

interface LoginAndSignUpFormLayoutProps {
  form: ReactNode;
  extra: ReactNode;
  title: ReactNode;
}

export const LoginAndSignUpFormLayout = ({
  form,
  extra,
  title
}: LoginAndSignUpFormLayoutProps) => (
  <Center mt={"xl"}>
    <Paper shadow="sm" p="xl" w={500}>
      <Stack>
        {title}
        {form}
        {extra}
      </Stack>
    </Paper>
  </Center>
)