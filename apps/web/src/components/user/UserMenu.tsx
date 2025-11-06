import { Avatar, Menu, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useLogout } from '@/hooks/auth/useLogout';
import { authClient } from '@/utils/authClient';

const UserMenu = () => {
  const { t } = useTranslation();
  const handleLogout = useLogout();
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session?.user) {
    return null;
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Avatar
            alt={session?.user.name}
            color="initials"
            name={session?.user.name}
          />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={handleLogout}>
          {t(($) => $.signInSignUp.logout)}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
