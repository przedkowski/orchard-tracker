-- AlterTable
ALTER TABLE "SprayRecord" ADD COLUMN     "phiDays" INTEGER;

-- CreateTable
CREATE TABLE "UserProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserProduct_userId_idx" ON "UserProduct"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProduct_userId_name_key" ON "UserProduct"("userId", "name");

-- AddForeignKey
ALTER TABLE "UserProduct" ADD CONSTRAINT "UserProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
