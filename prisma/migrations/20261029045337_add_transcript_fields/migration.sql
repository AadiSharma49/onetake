-- CreateEnum
CREATE TYPE "TranscriptStatus" AS ENUM ('NONE', 'PENDING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Recording" ADD COLUMN     "transcriptJson" JSONB,
ADD COLUMN     "transcriptStatus" "TranscriptStatus" NOT NULL DEFAULT 'NONE';
