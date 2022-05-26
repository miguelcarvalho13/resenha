import type { User, Review } from "@prisma/client";

import { prisma } from "~/db.server";
import { Level } from "~/models/review-access.server";

export type { Review } from "@prisma/client";

export function getReview({
  id,
  userId,
}: Pick<Review, "id"> & {
  userId: User["id"];
}) {
  return prisma.review.findFirst({
    where: { id, userId },
  });
}

export function getReviewListItems({ userId }: { userId: User["id"] }) {
  return prisma.review.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createReview({
  body,
  title,
  userId,
}: Pick<Review, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.review.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
      reviewAccesses: {
        create: [
          { userId: userId, level: Level.ADMIN }
        ]
      }
    },
  });
}

export function deleteReview({
  id,
  userId,
}: Pick<Review, "id"> & { userId: User["id"] }) {
  return prisma.review.deleteMany({
    where: { id, userId },
  });
}
