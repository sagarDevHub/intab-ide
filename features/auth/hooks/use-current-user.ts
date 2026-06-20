import { authClient } from '../client';

export const useCurrentUser = () => {
  const { data: session } = authClient.useSession();
  return session?.user;
};
