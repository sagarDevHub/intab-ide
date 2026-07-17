'use server';

import { auth } from '@/features/auth/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis/redis';
import { headers } from 'next/headers';
import { TemplateFolder } from '../lib/path-to-json';
import { Prisma } from '@prisma/client';

export type DynamicPlaygroundPayload = Prisma.PlaygroundGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    templateFile: {
      select: {
        content: true;
      };
    };
  };
}>;

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

const getPlaygroundCacheKey = (id: string) => `playground:meta:${id}`;
const getVfsTreeCacheKey = (id: string) => `playground:vfs:${id}`;

export const getPlaygroundById = async (id: string): Promise<DynamicPlaygroundPayload | null> => {
  try {
    await getAuthenticatedUser();
    const cacheKey = getPlaygroundCacheKey(id);

    const cachedPlayground = await redis.get<DynamicPlaygroundPayload>(cacheKey);

    if (cachedPlayground) {
      return cachedPlayground;
    }
    const playground = await db.playground.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        templateFile: {
          select: {
            content: true,
          },
        },
      },
    });

    if (playground) {
      await redis.set(cacheKey, playground, { ex: 3600 });
    }
    return playground;
  } catch (error) {
    console.error('Error in getPlaygroundById:', error);
    return null;
  }
};

export const saveUpdatedCode = async (playgroundId: string, data: TemplateFolder) => {
  try {
    await getAuthenticatedUser();
    const updatedPlayground = await db.templateFile.upsert({
      where: {
        playgroundId,
      },
      update: {
        content: data as unknown as Prisma.InputJsonValue,
      },
      create: {
        playgroundId,
        content: data as unknown as Prisma.InputJsonValue,
      },
    });

    await redis.del(getPlaygroundCacheKey(playgroundId));
    await redis.del(getVfsTreeCacheKey(playgroundId));
    return { success: true, data: updatedPlayground };
  } catch (error) {
    console.error('Error saving workspace template data:', error);
    return { success: false, error: 'Failed to commit template data asset' };
  }
};
