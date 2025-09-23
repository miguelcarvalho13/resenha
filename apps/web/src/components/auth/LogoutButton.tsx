import { useNavigate } from '@tanstack/react-router';

import { authClient } from '@/utils/authClient';

export const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/sign-in' });
        },
      },
    });
  };

  return <button onClick={handleLogout}>Logout</button>;
};
