-- AlterTable
ALTER TABLE `User` MODIFY `otp` INTEGER NULL,
    MODIFY `otpExpireData` DATETIME(3) NULL;
