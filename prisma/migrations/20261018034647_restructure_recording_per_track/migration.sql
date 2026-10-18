/*
  Warnings:

  - You are about to drop the column `camUrl` on the `Recording` table. All the data in the column will be lost.
  - You are about to drop the column `durationSeconds` on the `Recording` table. All the data in the column will be lost.
  - You are about to drop the column `micUrl` on the `Recording` table. All the data in the column will be lost.
  - You are about to drop the column `screenUrl` on the `Recording` table. All the data in the column will be lost.
  - Added the required column `kind` to the `Recording` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Recording` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startOffsetMs` to the `Recording` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKeyPrefix` to the `Recording` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Recording` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecordingKind" AS ENUM ('SCREEN', 'CAMERA', 'MIC');

-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('UPLOADING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Recording" DROP COLUMN "camUrl",
DROP COLUMN "durationSeconds",
DROP COLUMN "micUrl",
DROP COLUMN "screenUrl",
ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "kind" "RecordingKind" NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "startOffsetMs" INTEGER NOT NULL,
ADD COLUMN     "status" "RecordingStatus" NOT NULL DEFAULT 'UPLOADING',
ADD COLUMN     "storageKeyPrefix" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
