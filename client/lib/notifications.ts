import { toast } from 'sonner';

export const notify = {
  success(title: string, description?: string) {
    toast.success(title, {
      description,
    });
  },

  error(title: string, description?: string) {
    toast.error(title, {
      description: description ?? 'Please try again or contact system administrators.',
    });
  },

  info(title: string, description?: string) {
    toast.info(title, {
      description,
    });
  },
};
