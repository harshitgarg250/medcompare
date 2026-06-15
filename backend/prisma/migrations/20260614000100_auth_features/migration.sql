ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

ALTER TABLE "User" ADD COLUMN "profilePicture" TEXT;
ALTER TABLE "User" ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'email';
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
ALTER TABLE "User" ADD COLUMN "resetPasswordOtpHash" TEXT;
ALTER TABLE "User" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
