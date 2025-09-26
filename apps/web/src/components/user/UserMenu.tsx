import { Avatar, Menu, UnstyledButton } from '@mantine/core';

import { useLogout } from '@/hooks/auth/useLogout';
import { authClient } from '@/utils/authClient';

const UserMenu = () => {
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
        <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
