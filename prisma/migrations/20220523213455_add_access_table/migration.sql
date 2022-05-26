-- CreateTable
CREATE TABLE "ReviewAccess" (
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    PRIMARY KEY ("reviewId", "userId"),
    CONSTRAINT "ReviewAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewAccess_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewAccess_reviewId_userId_key" ON "ReviewAccess"("reviewId", "userId");
