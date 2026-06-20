import React from 'react';
import { LogoutButtonProps } from '../types';
import { useRouter } from 'next/navigation';
import { authClient } from '../client';

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();
  const onLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/auth/sign-in');
          router.refresh();
        },
      },
    });
  };
  return (
    <span className="cursor-pointer" onClick={onLogout}>
      {children}
    </span>
  );
};

export default LogoutButton;
