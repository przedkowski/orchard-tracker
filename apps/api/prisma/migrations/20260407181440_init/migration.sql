-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrchardSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cropType" TEXT NOT NULL,
    "areaHa" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OrchardSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SprayRecord" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "doseLPerHa" DOUBLE PRECISION NOT NULL,
    "sprayedAt" TIMESTAMP(3) NOT NULL,
    "weatherNote" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "SprayRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "OrchardSection_userId_idx" ON "public"."OrchardSection"("userId");

-- CreateIndex
CREATE INDEX "SprayRecord_userId_idx" ON "public"."SprayRecord"("userId");

-- CreateIndex
CREATE INDEX "SprayRecord_sectionId_idx" ON "public"."SprayRecord"("sectionId");

-- CreateIndex
CREATE INDEX "SprayRecord_sprayedAt_idx" ON "public"."SprayRecord"("sprayedAt");

-- AddForeignKey
ALTER TABLE "public"."OrchardSection" ADD CONSTRAINT "OrchardSection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SprayRecord" ADD CONSTRAINT "SprayRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SprayRecord" ADD CONSTRAINT "SprayRecord_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."OrchardSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
