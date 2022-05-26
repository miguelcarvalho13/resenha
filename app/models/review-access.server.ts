import type { User, Review } from "@prisma/client";

import { prisma } from "~/db.server";

export enum Level {
  ADMIN = 0,
  EDITOR = 1,
  VIEWER = 2,
}

export function canEditReview(review: Review, userId: User['id']): boolean {
  return false;
}

export function canViewReview(review: Review, userId: User['id']): boolean {
  return false;
}
