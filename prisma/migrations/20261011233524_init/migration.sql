-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('minor', 'moderate', 'major');

-- CreateEnum
CREATE TYPE "IssueKind" AS ENUM ('owner_reported', 'service_bulletin', 'recall');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('rebate', 'financing', 'pro', 'military', 'first_responder', 'ag', 'loyalty', 'racer');

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "modelSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "kind" "IssueKind" NOT NULL DEFAULT 'owner_reported',
    "years" TEXT NOT NULL DEFAULT 'All',
    "symptoms" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "estCost" TEXT NOT NULL DEFAULT '',
    "mentions" INTEGER NOT NULL DEFAULT 0,
    "sources" TEXT[],
    "sourceUrls" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "lastVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promo" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "title" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "categories" TEXT[],
    "models" TEXT,
    "eligibility" TEXT NOT NULL,
    "ends" TIMESTAMP(3) NOT NULL,
    "verifyUrl" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "lastVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Issue_modelSlug_idx" ON "Issue"("modelSlug");
