'use server';

import { auth } from '@/features/auth/server';
import { db } from '@/lib/db';
import { Templates } from '@prisma/client';
import { headers } from 'next/headers';

export const createPlayground = async (data: {
  title: string;
  template: Templates;
  description?: string;
  userId: string;
}) => {
  const { template, title, description } = data;
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  const user = sessionData?.user;

  if (!user?.id) {
    throw new Error(`Unauthorized: You must be logged in to create a playground workspace.`);
  }
  try {
    const playground = await db.playground.create({
      data: {
        title,
        description: description ?? '',
        template,
        userId: user?.id,
      },
    });
    return playground;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllPlaygroundForUser = async () => {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  const user = sessionData?.user;

  try {
    const playground = await db.playground.findMany({
      where: {
        userId: user?.id,
      },
      include: {
        user: true,
        starmark: {
          where: {
            userId: user?.id,
          },
          select: {
            isMarked: true,
          },
        },
      },
    });

    return playground;
  } catch (error) {
    console.error(error);
    return null;
  }
};
