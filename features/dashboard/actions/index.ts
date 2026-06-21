'use server';

import { auth } from '@/features/auth/server';
import { db } from '@/lib/db';
import { Templates } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

async function getAuthenticatedUser() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });
  const user = sessionData?.user;
  if (!user?.id) {
    throw new Error(`Unauthorized: Authentic user context not resolved`);
  }
  return user;
}

export const createPlayground = async (data: {
  title: string;
  template: Templates;
  description?: string;
}) => {
  try {
    const user = await getAuthenticatedUser();
    const { template, title, description } = data;
    const playground = await db.playground.create({
      data: {
        title,
        description: description ?? '',
        template,
        userId: user.id,
      },
    });

    revalidatePath('/dashboard');
    return { success: true, data: playground };
  } catch (error) {
    console.error('Error creating playground', error);
    return { success: false, error: 'Failed to create workspace container' };
  }
};

export const getAllPlaygroundForUser = async () => {
  try {
    const user = await getAuthenticatedUser();

    const playgrounds = await db.playground.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
        starmark: {
          where: {
            userId: user.id,
          },
          select: {
            isMarked: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return playgrounds;
  } catch (error) {
    console.error('Error fetching playgrounds:', error);
    return [];
  }
};

export const deleteProjectById = async (id: string) => {
  try {
    const user = await getAuthenticatedUser();

    await db.playground.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: 'Failed to remove project asset' };
  }
};

export const editProjectById = async (id: string, data: { title: string; description: string }) => {
  try {
    const user = await getAuthenticatedUser();

    await db.playground.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        title: data.title,
        description: data.description,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath(`/playground/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error: 'Failed to save changes' };
  }
};

export const duplicateProjectById = async (id: string) => {
  try {
    const user = await getAuthenticatedUser();

    const originalPlayground = await db.playground.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!originalPlayground) {
      return { success: false, error: 'Playground not found or access denied' };
    }

    const duplicatedPlayground = await db.playground.create({
      data: {
        title: `${originalPlayground.title} (Copy)`,
        description: originalPlayground.description,
        template: originalPlayground.template,
        userId: user.id,
      },
    });

    revalidatePath('/dashboard');
    return { success: true, data: duplicatedPlayground };
  } catch (error) {
    console.error('Error duplicating project:', error);
    return { success: false, error: 'Failed to duplicate workspace' };
  }
};
