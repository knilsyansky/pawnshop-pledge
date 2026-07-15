/*
  Warnings:

  - The primary key for the `ItemCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `ItemCategory` table. All the data in the column will be lost.
  - The primary key for the `Tariff` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Tariff` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pledge" DROP CONSTRAINT "Pledge_tariffId_fkey";

-- DropForeignKey
ALTER TABLE "PledgeItem" DROP CONSTRAINT "PledgeItem_categoryId_fkey";

-- AlterTable
ALTER TABLE "ItemCategory" DROP CONSTRAINT "ItemCategory_pkey",
DROP COLUMN "name",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ItemCategory_id_seq";

-- AlterTable
ALTER TABLE "Pledge" ALTER COLUMN "tariffId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PledgeItem" ALTER COLUMN "categoryId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Tariff" DROP CONSTRAINT "Tariff_pkey",
DROP COLUMN "name",
ADD COLUMN     "overduePeriodDays" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Tariff_id_seq";

-- AddForeignKey
ALTER TABLE "Pledge" ADD CONSTRAINT "Pledge_tariffId_fkey" FOREIGN KEY ("tariffId") REFERENCES "Tariff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PledgeItem" ADD CONSTRAINT "PledgeItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
