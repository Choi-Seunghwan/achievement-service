-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVATE', 'DELETED');

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "is_guest" BOOLEAN NOT NULL DEFAULT false,
    "guest_id" TEXT,
    "login_id" VARCHAR(20),
    "email" VARCHAR(255),
    "nickname" VARCHAR(30) NOT NULL,
    "encrypt_password" VARCHAR(255),
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "image" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_account" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "provider" VARCHAR(20) NOT NULL,
    "provider_user_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "social_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(1100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_guest_id_key" ON "account"("guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_login_id_key" ON "account"("login_id");

-- CreateIndex
CREATE INDEX "account_guest_id_login_id_email_idx" ON "account"("guest_id", "login_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "social_account_account_id_key" ON "social_account"("account_id");

-- CreateIndex
CREATE INDEX "social_account_provider_provider_user_id_idx" ON "social_account"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_account_provider_provider_user_id_key" ON "social_account"("provider", "provider_user_id");

-- AddForeignKey
ALTER TABLE "social_account" ADD CONSTRAINT "social_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
