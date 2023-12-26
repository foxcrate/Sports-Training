-- MySQL dump 10.13  Distrib 8.0.35, for Linux (x86_64)
--
-- Host: localhost    Database: instaplay_dev
-- ------------------------------------------------------
-- Server version	8.0.35-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `DoctorClinic`
--

DROP TABLE IF EXISTS `DoctorClinic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoctorClinic` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost` int DEFAULT NULL,
  `slotDuration` int DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` decimal(65,30) DEFAULT NULL,
  `latitude` decimal(65,30) DEFAULT NULL,
  `profileImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acceptanceStatus` enum('accepted','pending','declined') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `availableWeekDays` json DEFAULT NULL,
  `availableDayHours` json DEFAULT NULL,
  `addedByUserId` int DEFAULT NULL,
  `regionId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `doctorClinicSpecializationId` int DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `DoctorClinic_addedByUserId_fkey` (`addedByUserId`),
  KEY `DoctorClinic_regionId_fkey` (`regionId`),
  KEY `DoctorClinic_doctorClinicSpecializationId_fkey` (`doctorClinicSpecializationId`),
  CONSTRAINT `DoctorClinic_addedByUserId_fkey` FOREIGN KEY (`addedByUserId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DoctorClinic_doctorClinicSpecializationId_fkey` FOREIGN KEY (`doctorClinicSpecializationId`) REFERENCES `DoctorClinicSpecialization` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `DoctorClinic_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoctorClinic`
--

LOCK TABLES `DoctorClinic` WRITE;
/*!40000 ALTER TABLE `DoctorClinic` DISABLE KEYS */;
INSERT INTO `DoctorClinic` VALUES (2,'el-hamd clinic updated2','very nice field !!',100,60,'share3 el haram, el3rouba',1.443330000000000000000000000000,1.433200000000000000000000000000,'https://www.google.com','accepted','[\"Saturday\", \"Tuesday\"]','{\"to\": \"18:00\", \"from\": \"08:00\"}',22,1,'2023-12-07 12:22:18.874',NULL,'2023-12-07 12:29:07.061');
/*!40000 ALTER TABLE `DoctorClinic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoctorClinicNotAvailableDays`
--

DROP TABLE IF EXISTS `DoctorClinicNotAvailableDays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoctorClinicNotAvailableDays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dayDate` datetime(3) NOT NULL,
  `doctorClinicId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `DoctorClinicNotAvailableDays_doctorClinicId_fkey` (`doctorClinicId`),
  CONSTRAINT `DoctorClinicNotAvailableDays_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoctorClinicNotAvailableDays`
--

LOCK TABLES `DoctorClinicNotAvailableDays` WRITE;
/*!40000 ALTER TABLE `DoctorClinicNotAvailableDays` DISABLE KEYS */;
INSERT INTO `DoctorClinicNotAvailableDays` VALUES (3,'2023-01-02 00:00:00.000',2,'2023-12-07 12:29:34.451','2023-12-07 12:29:34.451'),(4,'2023-02-02 00:00:00.000',2,'2023-12-07 12:29:34.451','2023-12-07 12:29:34.451');
/*!40000 ALTER TABLE `DoctorClinicNotAvailableDays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoctorClinicSpecialization`
--

DROP TABLE IF EXISTS `DoctorClinicSpecialization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoctorClinicSpecialization` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoctorClinicSpecialization`
--

LOCK TABLES `DoctorClinicSpecialization` WRITE;
/*!40000 ALTER TABLE `DoctorClinicSpecialization` DISABLE KEYS */;
INSERT INTO `DoctorClinicSpecialization` VALUES (1,'nutrition2','2023-12-07 09:44:14.655','2023-12-07 09:44:14.655'),(2,'nutrition1','2023-12-07 09:44:20.811','2023-12-07 09:44:20.811');
/*!40000 ALTER TABLE `DoctorClinicSpecialization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoctorClinicsBookedHours`
--

DROP TABLE IF EXISTS `DoctorClinicsBookedHours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoctorClinicsBookedHours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fromDateTime` datetime(3) NOT NULL,
  `gmt` int NOT NULL DEFAULT '0',
  `userId` int NOT NULL,
  `doctorClinicId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `DoctorClinicsBookedHours_userId_fkey` (`userId`),
  KEY `DoctorClinicsBookedHours_doctorClinicId_fkey` (`doctorClinicId`),
  CONSTRAINT `DoctorClinicsBookedHours_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DoctorClinicsBookedHours_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoctorClinicsBookedHours`
--

LOCK TABLES `DoctorClinicsBookedHours` WRITE;
/*!40000 ALTER TABLE `DoctorClinicsBookedHours` DISABLE KEYS */;
/*!40000 ALTER TABLE `DoctorClinicsBookedHours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Field`
--

DROP TABLE IF EXISTS `Field`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Field` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `availableDayHours` json DEFAULT NULL,
  `availableWeekDays` json DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost` int DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(65,30) DEFAULT NULL,
  `longitude` decimal(65,30) DEFAULT NULL,
  `profileImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `regionId` int DEFAULT NULL,
  `slotDuration` int DEFAULT NULL,
  `sportId` int DEFAULT NULL,
  `addedByUserId` int DEFAULT NULL,
  `acceptanceStatus` enum('accepted','pending','declined') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Field_sportId_fkey` (`sportId`),
  KEY `Field_regionId_fkey` (`regionId`),
  KEY `Field_addedByUserId_fkey` (`addedByUserId`),
  CONSTRAINT `Field_addedByUserId_fkey` FOREIGN KEY (`addedByUserId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Field_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Field_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Field`
--

LOCK TABLES `Field` WRITE;
/*!40000 ALTER TABLE `Field` DISABLE KEYS */;
INSERT INTO `Field` VALUES (5,'el-mona174','2023-12-09 14:44:07.394','{\"to\": \"18:00\", \"from\": \"08:00\"}','[\"Saturday\", \"Sunday\"]','share3 el haram, el3rouba',100,'very nice field !!',1.433200000000000000000000000000,1.443330000000000000000000000000,'https://www.google.com',1,60,1,22,'accepted','2023-12-09 14:53:37.734'),(6,'el-mona2','2023-12-09 14:52:01.146','{\"to\": \"18:00\", \"from\": \"08:00\"}','[\"Saturday\", \"Sunday\"]','share3 el haram, el3rouba',100,'very nice field !!',1.433200000000000000000000000000,1.443330000000000000000000000000,'https://www.google.com',1,60,1,NULL,'accepted','2023-12-09 14:52:01.146');
/*!40000 ALTER TABLE `Field` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FieldNotAvailableDays`
--

DROP TABLE IF EXISTS `FieldNotAvailableDays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FieldNotAvailableDays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dayDate` datetime(3) NOT NULL,
  `fieldId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `FieldNotAvailableDays_fieldId_fkey` (`fieldId`),
  CONSTRAINT `FieldNotAvailableDays_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FieldNotAvailableDays`
--

LOCK TABLES `FieldNotAvailableDays` WRITE;
/*!40000 ALTER TABLE `FieldNotAvailableDays` DISABLE KEYS */;
/*!40000 ALTER TABLE `FieldNotAvailableDays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FieldsBookedHours`
--

DROP TABLE IF EXISTS `FieldsBookedHours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FieldsBookedHours` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fromDateTime` datetime(3) NOT NULL,
  `userId` int NOT NULL,
  `fieldId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `gmt` int NOT NULL DEFAULT '0',
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `FieldsBookedHours_userId_fkey` (`userId`),
  KEY `FieldsBookedHours_fieldId_fkey` (`fieldId`),
  CONSTRAINT `FieldsBookedHours_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FieldsBookedHours_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FieldsBookedHours`
--

LOCK TABLES `FieldsBookedHours` WRITE;
/*!40000 ALTER TABLE `FieldsBookedHours` DISABLE KEYS */;
/*!40000 ALTER TABLE `FieldsBookedHours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Month`
--

DROP TABLE IF EXISTS `Month`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Month` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monthNumber` int DEFAULT NULL,
  `monthName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Month`
--

LOCK TABLES `Month` WRITE;
/*!40000 ALTER TABLE `Month` DISABLE KEYS */;
INSERT INTO `Month` VALUES (1,1,'January','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(2,2,'February','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(3,3,'March','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(4,4,'April','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(5,5,'May','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(6,6,'June','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(7,7,'July','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(8,8,'August','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(9,9,'September','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(10,10,'October','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(11,11,'November','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040'),(12,12,'December','2023-11-29 13:33:10.057','2023-12-06 20:53:43.040');
/*!40000 ALTER TABLE `Month` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OTP`
--

DROP TABLE IF EXISTS `OTP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OTP` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mobileNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OTP`
--

LOCK TABLES `OTP` WRITE;
/*!40000 ALTER TABLE `OTP` DISABLE KEYS */;
/*!40000 ALTER TABLE `OTP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ParentsChilds`
--

DROP TABLE IF EXISTS `ParentsChilds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ParentsChilds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parentId` int NOT NULL,
  `childId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ParentsChilds_parentId_childId_key` (`parentId`,`childId`),
  KEY `ParentsChilds_childId_fkey` (`childId`),
  CONSTRAINT `ParentsChilds_childId_fkey` FOREIGN KEY (`childId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ParentsChilds_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ParentsChilds`
--

LOCK TABLES `ParentsChilds` WRITE;
/*!40000 ALTER TABLE `ParentsChilds` DISABLE KEYS */;
INSERT INTO `ParentsChilds` VALUES (2,22,34,'2023-12-07 08:58:32.838','2023-12-07 08:58:32.838');
/*!40000 ALTER TABLE `ParentsChilds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PlayerProfile`
--

DROP TABLE IF EXISTS `PlayerProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PlayerProfile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `regionId` int DEFAULT NULL,
  `level` enum('beginner','intermediate','advanced') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `PlayerProfile_userId_key` (`userId`),
  KEY `PlayerProfile_regionId_fkey` (`regionId`),
  CONSTRAINT `PlayerProfile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `PlayerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PlayerProfile`
--

LOCK TABLES `PlayerProfile` WRITE;
/*!40000 ALTER TABLE `PlayerProfile` DISABLE KEYS */;
INSERT INTO `PlayerProfile` VALUES (7,34,NULL,'beginner','2023-12-07 09:40:05.940','2023-12-07 09:40:05.940'),(8,22,1,'beginner','2023-12-12 08:30:43.803','2023-12-12 08:31:03.820'),(9,42,1,'beginner','2023-12-19 23:05:33.127','2023-12-19 23:07:22.039'),(10,38,1,'advanced','2023-12-19 23:23:47.659','2023-12-20 11:51:27.228');
/*!40000 ALTER TABLE `PlayerProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PlayerProfileSports`
--

DROP TABLE IF EXISTS `PlayerProfileSports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PlayerProfileSports` (
  `playerProfileId` int NOT NULL,
  `sportId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`playerProfileId`,`sportId`),
  KEY `PlayerProfileSports_sportId_fkey` (`sportId`),
  CONSTRAINT `PlayerProfileSports_playerProfileId_fkey` FOREIGN KEY (`playerProfileId`) REFERENCES `PlayerProfile` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PlayerProfileSports_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PlayerProfileSports`
--

LOCK TABLES `PlayerProfileSports` WRITE;
/*!40000 ALTER TABLE `PlayerProfileSports` DISABLE KEYS */;
INSERT INTO `PlayerProfileSports` VALUES (7,1,'2023-12-07 09:40:05.949','2023-12-07 09:40:05.949'),(8,1,'2023-12-12 08:30:53.487','2023-12-12 08:30:53.487'),(8,2,'2023-12-12 08:30:53.487','2023-12-12 08:30:53.487'),(9,1,'2023-12-20 11:52:02.517','2023-12-20 11:52:02.517'),(9,2,'2023-12-20 11:52:02.517','2023-12-20 11:52:02.517');
/*!40000 ALTER TABLE `PlayerProfileSports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rate`
--

DROP TABLE IF EXISTS `Rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Rate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ratingNumber` int DEFAULT NULL,
  `feedback` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rateableType` enum('trainer','field','doctorClinic') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fieldId` int DEFAULT NULL,
  `doctorClinicId` int DEFAULT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Rate_fieldId_fkey` (`fieldId`),
  KEY `Rate_doctorClinicId_fkey` (`doctorClinicId`),
  KEY `Rate_userId_fkey` (`userId`),
  CONSTRAINT `Rate_doctorClinicId_fkey` FOREIGN KEY (`doctorClinicId`) REFERENCES `DoctorClinic` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Rate_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Rate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rate`
--

LOCK TABLES `Rate` WRITE;
/*!40000 ALTER TABLE `Rate` DISABLE KEYS */;
/*!40000 ALTER TABLE `Rate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Region`
--

DROP TABLE IF EXISTS `Region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Region` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Region`
--

LOCK TABLES `Region` WRITE;
/*!40000 ALTER TABLE `Region` DISABLE KEYS */;
INSERT INTO `Region` VALUES (1,'2023-11-11 05:28:42.246','Monira','2023-12-06 20:53:43.171');
/*!40000 ALTER TABLE `Region` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Schedule`
--

DROP TABLE IF EXISTS `Schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trainerProfileId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Schedule_trainerProfileId_fkey` (`trainerProfileId`),
  CONSTRAINT `Schedule_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Schedule`
--

LOCK TABLES `Schedule` WRITE;
/*!40000 ALTER TABLE `Schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `Schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SchedulesMonths`
--

DROP TABLE IF EXISTS `SchedulesMonths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SchedulesMonths` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scheduleId` int NOT NULL,
  `monthId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `SchedulesMonths_scheduleId_monthId_key` (`scheduleId`,`monthId`),
  KEY `SchedulesMonths_monthId_fkey` (`monthId`),
  CONSTRAINT `SchedulesMonths_monthId_fkey` FOREIGN KEY (`monthId`) REFERENCES `Month` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SchedulesMonths_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SchedulesMonths`
--

LOCK TABLES `SchedulesMonths` WRITE;
/*!40000 ALTER TABLE `SchedulesMonths` DISABLE KEYS */;
/*!40000 ALTER TABLE `SchedulesMonths` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Slot`
--

DROP TABLE IF EXISTS `Slot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Slot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scheduleId` int NOT NULL,
  `cost` int DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weekDayName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weekDayNumber` int DEFAULT NULL,
  `fromTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fieldId` int DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Slot_scheduleId_fkey` (`scheduleId`),
  KEY `Slot_fieldId_fkey` (`fieldId`),
  CONSTRAINT `Slot_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Slot_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Slot`
--

LOCK TABLES `Slot` WRITE;
/*!40000 ALTER TABLE `Slot` DISABLE KEYS */;
/*!40000 ALTER TABLE `Slot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sport`
--

DROP TABLE IF EXISTS `Sport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sport` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sport`
--

LOCK TABLES `Sport` WRITE;
/*!40000 ALTER TABLE `Sport` DISABLE KEYS */;
INSERT INTO `Sport` VALUES (1,'2023-10-10 08:53:58.864','football','2023-12-06 20:53:43.272'),(2,'2023-10-10 08:54:18.440','basketball','2023-12-06 20:53:43.272');
/*!40000 ALTER TABLE `Sport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TrainerProfile`
--

DROP TABLE IF EXISTS `TrainerProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TrainerProfile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` enum('beginner','intermediate','advanced') COLLATE utf8mb4_unicode_ci DEFAULT 'beginner',
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ageGroup` enum('kids','young_adults','adults') COLLATE utf8mb4_unicode_ci DEFAULT 'young_adults',
  `sessionDescription` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `regionId` int DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `TrainerProfile_userId_key` (`userId`),
  KEY `TrainerProfile_regionId_fkey` (`regionId`),
  CONSTRAINT `TrainerProfile_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `Region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `TrainerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TrainerProfile`
--

LOCK TABLES `TrainerProfile` WRITE;
/*!40000 ALTER TABLE `TrainerProfile` DISABLE KEYS */;
INSERT INTO `TrainerProfile` VALUES (2,'advanced',22,'2023-12-09 14:41:57.798','adults','a nice trainer!',1,'2023-12-09 14:41:57.798'),(3,NULL,38,'2023-12-14 15:35:14.611',NULL,NULL,1,'2023-12-14 15:35:14.611');
/*!40000 ALTER TABLE `TrainerProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TrainerProfileFields`
--

DROP TABLE IF EXISTS `TrainerProfileFields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TrainerProfileFields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trainerProfileId` int NOT NULL,
  `fieldId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `TrainerProfileFields_trainerProfileId_fieldId_key` (`trainerProfileId`,`fieldId`),
  KEY `TrainerProfileFields_fieldId_fkey` (`fieldId`),
  CONSTRAINT `TrainerProfileFields_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TrainerProfileFields_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TrainerProfileFields`
--

LOCK TABLES `TrainerProfileFields` WRITE;
/*!40000 ALTER TABLE `TrainerProfileFields` DISABLE KEYS */;
/*!40000 ALTER TABLE `TrainerProfileFields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TrainerProfileSports`
--

DROP TABLE IF EXISTS `TrainerProfileSports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TrainerProfileSports` (
  `trainerProfileId` int NOT NULL,
  `sportId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`trainerProfileId`,`sportId`),
  KEY `TrainerProfileSports_sportId_fkey` (`sportId`),
  CONSTRAINT `TrainerProfileSports_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TrainerProfileSports_trainerProfileId_fkey` FOREIGN KEY (`trainerProfileId`) REFERENCES `TrainerProfile` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TrainerProfileSports`
--

LOCK TABLES `TrainerProfileSports` WRITE;
/*!40000 ALTER TABLE `TrainerProfileSports` DISABLE KEYS */;
INSERT INTO `TrainerProfileSports` VALUES (2,1,'2023-12-09 14:41:57.806','2023-12-09 14:41:57.806'),(2,2,'2023-12-09 14:41:57.806','2023-12-09 14:41:57.806');
/*!40000 ALTER TABLE `TrainerProfileSports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobileNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('female','male') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthday` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isPhoneVerified` tinyint(1) NOT NULL DEFAULT '0',
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userType` enum('admin','user','child') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `provider` enum('facebook','google','apple','native') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'native',
  `profileImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fcm_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActivated` tinyint(1) NOT NULL DEFAULT '1',
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_mobileNumber_key` (`mobileNumber`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (20,NULL,NULL,NULL,'01115578285',NULL,NULL,'2023-12-06 09:09:12.293',0,'$2b$10$l/8Z/pUZLcDqFZrsBSbLeuzbKibQG8WejGXw.Nu0ps/57uQIVR4du','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(21,NULL,NULL,NULL,'01111111111',NULL,NULL,'2023-12-06 09:29:08.025',0,'$2b$10$G57chozsNt73G2foAPlGg.egUZOeP0Of2S.vV3YQbYE.OPrLeAAL2','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(22,'not Ahmed','fawzy',NULL,'04444','male','2023-09-03 00:00:00.000','2023-12-06 10:44:15.380',0,'$2b$10$ebiegGbt.iCElIfGEkiZ/.yguUEa1c/RLNvWOQL32XoI2YZR152xu','user','native','www.emafemfe.s',NULL,1,'2023-12-13 19:37:29.095'),(23,NULL,NULL,NULL,'00122222222',NULL,NULL,'2023-12-06 13:57:14.792',0,'$2b$10$T3BeKtz8gvBy4TjhpJ/pFuruCz5guNWPkCIAp43xBJZg9.Ys2wvTO','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(24,NULL,NULL,NULL,'00333333333',NULL,NULL,'2023-12-06 14:12:45.199',0,'$2b$10$MKnyWgF.dapZVijfMN7ka.S9.ABtn2eY9Zs2Duhj3chKJylDDZdeW','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(25,NULL,NULL,NULL,'06666666666',NULL,NULL,'2023-12-06 14:19:11.868',0,'$2b$10$AP3QIStepQunyPo2ASTODuSwVsUIrSGzWRVG6IARLGqIjWr9zVC6O','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(26,NULL,NULL,NULL,'09999999999',NULL,NULL,'2023-12-06 14:23:08.467',0,'$2b$10$5HnKpdaFtyCF0zBoIZAjRexdys/piIkg5x1lev9puWlFTF78o8q8m','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(27,NULL,NULL,NULL,'08888888888',NULL,NULL,'2023-12-06 14:29:59.550',0,'$2b$10$o92UpWWAjeUQZvGRw781VOruWXXx4VsZUPrfOiP60iivSSvhpn5aO','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(28,NULL,NULL,NULL,'06633663366',NULL,NULL,'2023-12-06 14:37:48.953',0,'$2b$10$9gs5BlXXidEgsUguG5atIeq01LYJ.q.MxQUSJmSMD1ksA1KMn0UAK','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(29,NULL,NULL,NULL,'03333222233',NULL,NULL,'2023-12-06 14:41:57.171',0,'$2b$10$pkKSfy.l5UWVdsilkifIrekXV0gQayufD70aNj2sxfahWmRiAt.Ie','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(30,NULL,NULL,NULL,'06633333333',NULL,NULL,'2023-12-06 14:58:19.397',0,'$2b$10$O8RTSMbioCX.n3cfIoFWie3hL80oTj2X1pPUbr4jygUEpe.zI2kHu','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(31,NULL,NULL,NULL,'03693399999',NULL,NULL,'2023-12-06 14:59:33.945',0,'$2b$10$zmuzn3aWYVPZtwYJVss5MOewSdTozQCWsZ2Ry7/H9pVHdYejZcRPi','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(32,NULL,NULL,NULL,'03333332222',NULL,NULL,'2023-12-06 15:05:33.190',0,'$2b$10$hjAnnGor2P5z9Q7wyRvPou/hoPqd4V2lxCPTy0n/nahfVetsB8VL2','user','native',NULL,NULL,1,'2023-12-06 20:53:42.782'),(34,'Ahmed','Junior','ahmedmustafa.pro33@gmail.com','+00000000033','male','2023-09-07 00:00:00.000','2023-12-07 08:58:32.833',0,'$2b$10$L6JiOGfnaETSd.WZcHTzr.dt72oJG.ropV4lponxsqwZXKaqfqNZ.','child','native',NULL,NULL,1,'2023-12-07 09:14:50.510'),(35,NULL,NULL,NULL,'02121212121',NULL,NULL,'2023-12-10 13:56:47.674',0,'$2b$10$Iz4lblBeib1J/xaTT9vjj.fPNDwRXqJEeM5Kx.3/l.I2quaIlgibq','user','native',NULL,NULL,1,'2023-12-10 13:56:55.094'),(36,NULL,NULL,NULL,'06868686757',NULL,NULL,'2023-12-10 14:00:54.995',0,'$2b$10$ZE48AHBKCaZAk3bORQMHiu1h4qyv4iZQU.H4UluVPEtbtP.5.vF16','user','native',NULL,NULL,1,'2023-12-10 14:01:03.315'),(37,'m','m','modeht@gmail.com','+201117778002','male','2023-09-07 10:00:00.000','2023-12-12 11:15:14.465',0,'$2b$10$RpZGU/ntKhBEdqmXk24oZ.dFzhxBZh8pKwx82DEtSy1TWoeNkmts6','user','native',NULL,NULL,1,'2023-12-12 11:15:14.465'),(38,'Omar','Ayman','o.ayman@wecodeforyou.io','01115578288',NULL,'1998-06-07 10:00:00.000','2023-12-14 15:29:15.077',0,'$2b$10$Xb6Z.cK6jaNy5/XNkENVy.UanXVUuCbxyezpDgs7dPTeuUnT5l66u','user','native','www.rjfuj.com',NULL,1,'2023-12-14 15:32:50.946'),(39,'Ahmed','Fawzy','ahmedmustafa.pro19293@gmail.com','+201550307033333333','male','2023-09-07 10:00:00.000','2023-12-14 15:38:46.894',0,'$2b$10$fGud.APoCpIYO2gxOvK6Su5AYyZRjBwkjTyeSlhZ9pVUlroV3skKa','user','native',NULL,NULL,1,'2023-12-14 15:38:46.894'),(40,NULL,NULL,NULL,'33333333333',NULL,NULL,'2023-12-19 11:15:44.655',0,'$2b$10$ktq.RYbyunUcZG75U7ObJORDMn5BeinLm22JxjDu3yHxh5yzlpzRa','user','native',NULL,NULL,1,'2023-12-19 11:18:10.542'),(41,NULL,NULL,NULL,'38606060686',NULL,NULL,'2023-12-19 12:07:30.849',0,'$2b$10$A0HeqdsXpts.4vD06chK0e5GYv3/8qmv6BgGHqgRiG8/5mQa5Pl7S','user','native',NULL,NULL,1,'2023-12-19 12:07:39.375'),(42,'Ahmed','Fawzy','s.pro19329@gmail.com','01553307091','male','2023-09-07 10:00:00.000','2023-12-19 13:05:02.411',0,'$2b$10$WgYslFrpHobugIORdoSSu.2JM.GKdd5Em6p/cTZdWN12AF1JnG4Sq','user','native','www.rjfuj.com',NULL,1,'2023-12-19 13:25:53.396'),(43,NULL,NULL,NULL,'99999999999',NULL,NULL,'2023-12-19 13:09:22.102',0,'$2b$10$T08uAMmwAVKZBqVa6H6v0.B1vfoHguZXzWAu.2Jz3YImdvjZJm6h6','user','native',NULL,NULL,1,'2023-12-19 13:09:44.522'),(44,'x','y','x@yy.com','22222222222','female','1990-01-01 00:00:00.000','2023-12-19 13:58:34.531',0,'$2b$10$FU9iZ4PH9kFRZ9qgMXb1vuG10RBAgBJgBL0SXpG7aPqHv5H2D44Ii','user','native','https://instaplay-dev.s3.eu-west-3.amazonaws.com/20231219_1328291702994332830.jpg',NULL,1,'2023-12-19 13:59:19.748'),(45,NULL,NULL,NULL,'01122703598',NULL,NULL,'2023-12-20 12:12:44.207',0,'$2b$10$ZSvNpl.g2VSmWvDOCqTmXuvmjG0QS3ERaHkiLv1jqzBTH/vY0.gPe','user','native',NULL,NULL,1,'2023-12-20 12:13:20.747');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('05df710f-ea35-42a3-b0db-6f01e3d474bb','2b4734b17a200cc8962c0bbc00b4bf0ae11a239b534716102d0be96d7f2fdd3f','2023-10-09 10:12:43.184','20230924110317_add_user_to_trainer_profile',NULL,NULL,'2023-10-09 10:12:43.081',1),('0980692c-4bbb-436a-a541-a2ac8ee65a1e','8874757e06ca65470e7893fc8182460475ccf0e13127741cf906e56fc17db6d3','2023-10-09 10:12:42.744','20230923110007_add_region_to_child_profile',NULL,NULL,'2023-10-09 10:12:42.654',1),('0b5a27ad-948c-4ed2-8b71-c5dce59e8162','2a95395a7ea0f41de5e6e7274537dd782c73f88d353b2475e7ace10133f6f937','2023-09-26 14:22:12.660','20230905190122_default_value_unknown_to_user_gender',NULL,NULL,'2023-09-26 14:22:12.634',1),('115335b1-7bd0-4047-9b3d-08bf7aa7c526','1e1d00bc473dd0a046a5faed93126accd85959fb0c3303cb35e137a10b55d8a3','2023-11-10 19:53:01.746','20231013143052_create_fields_table',NULL,NULL,'2023-11-10 19:53:01.710',1),('13bbab69-f4de-4c5b-8ed1-ea8d190cba8a','e8a3ef822f645cd6072ba596224ae1a89fc3fbf1e580444ec308154207dfc6a9','2023-11-10 19:53:03.612','20231103082504_create_rate_table',NULL,NULL,'2023-11-10 19:53:03.450',1),('15f0a6cb-d6cd-4b8b-af78-8cccec262668','a929b7dcb5d7dc434e3125d982948af691e8b0e2c93ccc53255435b8da2ab13d','2023-10-09 10:12:42.039','20230920141409_add_region_to_player_profile',NULL,NULL,'2023-10-09 10:12:41.941',1),('170fa503-ae02-48b2-808e-ef633e3086ac','943ec13159df08ed507038dc6fc3743487692307bd9eada2835ec4f70d2dbc89','2023-10-09 10:12:41.898','20230919130431_create_player_profile',NULL,NULL,'2023-10-09 10:12:41.776',1),('1c57208a-07a7-4f8b-8d0f-e69f50135142','6b4e3eb6f4e3c0769c998afc194254cee313fd3db1ef7353e584ece61403b5bd','2023-11-29 13:27:25.336','20231127075949_child_is_a_user',NULL,NULL,'2023-11-29 13:27:25.030',1),('299640ed-8d81-471b-8c80-bf8700ced148','6e3508852885b94bffb538042cd5f1c1570289ec41140fd794c50bdc5f1ae694','2023-09-26 14:22:12.690','20230906040106_add_password_to_user',NULL,NULL,'2023-09-26 14:22:12.665',1),('2ff21a43-af42-4b2d-94ab-e406a7cc8d23','8f78bcc6531d724113808de33b598fc8cbd66ea437bca9c8373144939661ae46','2023-11-29 13:27:25.885','20231129130947_remove_updated_at',NULL,NULL,'2023-11-29 13:27:25.501',1),('2ffb934c-171a-41ce-a4dc-0823dbe74e8d','7cc5d3b455d0a111f071bb42af441197dbf0dd462efac1b0674592ee5511753e','2023-11-29 13:27:23.930','20231112150936_make_cost_not_mandatory_in_slot',NULL,NULL,'2023-11-29 13:27:23.872',1),('3055c608-9351-4408-a471-52ba4f15b90b','26c1816894516e81ce804f267524074fd1a240c5b3cf5a0d0c56726346a75f62','2023-11-29 13:27:24.191','20231113095135_create_schedules_months_relation',NULL,NULL,'2023-11-29 13:27:24.007',1),('3217dcdd-f97b-4278-97ab-c7c79a411dcb','3795e0fa8377e5fc397e899571f9e0c138f7541fae529cbdc6a537e9d5c26f56','2023-12-06 20:53:42.771','20231206050932_set_user_id_null_in_field_on_delete',NULL,NULL,'2023-12-06 20:53:42.634',1),('3c13bc71-94ca-41bb-ade8-f970fab1c5f5','17cf54aba5fb717cb571873cabf4b34fda21d3bc85fb93d844ef60b2ef92550a','2023-11-29 13:27:24.649','20231118222812_add_session_description_to_trainer_profile',NULL,NULL,'2023-11-29 13:27:24.611',1),('3e0a1d4c-1606-43d4-b30d-0f779e056e33','042ca4e64b0e09cac995ac2e382099c08178fc132d658a0fec5a4d01468c7658','2023-11-29 13:27:23.743','20231112115150_create_schedule_and_slot_tables',NULL,NULL,'2023-11-29 13:27:23.573',1),('4079f9df-ab92-403a-8d5b-d704004018f1','55ada8da118f079d72fdd09c233ae74850d0c81e7a4556d2e920f3ee206f6365','2023-11-10 19:53:02.513','20231025125420_change_user_type_in_user',NULL,NULL,'2023-11-10 19:53:02.421',1),('4f69c3ab-eeb6-48d6-9711-d1657b2b7ee5','b5130db7d94560d3fcc0a9f38a7f9404132ae8797aff8efc0c37e7c4d97ac58b','2023-12-06 20:53:42.833','20231206192652_add_updated_at_to_user',NULL,NULL,'2023-12-06 20:53:42.776',1),('51c62a26-ea08-4f20-9b5e-1b2a169582f9','dddc666560996cc06bda5498f1591f8d123ff91e31667eb415d2d85d590b0b29','2023-11-10 19:53:04.129','20231104144552_create_doctor_clinic_specialization_table',NULL,NULL,'2023-11-10 19:53:03.890',1),('553b760e-712d-4492-a612-c0a8682b9fef','db1407a344b3a4d99ce5583b48821a6630d40268868c349b4fee008d6ff9abb6','2023-09-26 14:22:13.115','20230916104930_make_passwrod_default_null_in_user_and_child',NULL,NULL,'2023-09-26 14:22:12.999',1),('55b8b0c3-28da-4613-8818-c19e1011d7aa','750b0a44402ac1b6eff7c85217b9f5c0a8198818b65270b6221ee8c87f15daa2','2023-11-29 13:27:23.964','20231113050159_change_name_of_time_in_slot',NULL,NULL,'2023-11-29 13:27:23.935',1),('56c21821-5fae-43eb-b141-afe3629da71c','24081dd51a0687e3de02bcbdf3abbc383f6c4c8b85bfadba0550cf34bd8a2e44','2023-11-29 13:27:24.828','20231120025440_remove_updated_at_from_trainer_profile_fields',NULL,NULL,'2023-11-29 13:27:24.769',1),('5897afbb-d1ff-4260-bc9f-251c637714df','9bc12643cd21910b5afec6f440de0b6f95306def0b89ecccf72ffc725f598682','2023-11-29 13:27:24.607','20231118221131_add_fields_and_age_group_to_trainer_profile',NULL,NULL,'2023-11-29 13:27:24.411',1),('5ece5a34-b287-4b26-9670-0094eda4899a','e4c120b4521d8cb4659d64166cfb37538177b949c5182389d41a36d0aafe1c12','2023-09-26 14:22:12.719','20230906042428_lowercasing_user_gender_names',NULL,NULL,'2023-09-26 14:22:12.694',1),('609fb84d-dd86-4d5b-9765-2a7b51d4adae','b1f5ca7b65f72f882cf991a2ab02ce6dd6a4226e4b193c0b206d1f502ddf7b33','2023-11-10 19:53:01.935','20231014030951_create_fields_booked_hours_table',NULL,NULL,'2023-11-10 19:53:01.751',1),('625ce9c0-12bf-4d6b-b307-b6c715930a15','8c12ba7f6a334f27f45ee80169797bfd9bfe7b7478cc3bd4a3bc1b1d32f3ada4','2023-11-10 19:53:02.417','20231022193615_add_details_to_field',NULL,NULL,'2023-11-10 19:53:02.238',1),('6a16e3b9-0f3e-4ca6-b420-399d3d4e7e34','72f4cf157e87385c772170778d6bafc0f9af9e0afbf6bb5f2f1118b9ef2b8983','2023-11-10 19:53:02.688','20231025134107_add_acceptance_status_to_field',NULL,NULL,'2023-11-10 19:53:02.647',1),('6a3f56c9-6521-45f5-993f-f66d3c83eb07','2212dc6b63873a8b883c77aaf493a17e5ccc4514f806ca17bd28132453d1b1ac','2023-10-09 10:12:42.160','20230920234412_add_provider_to_user',NULL,NULL,'2023-10-09 10:12:42.122',1),('6d8dd45d-b007-4080-a442-56ca0bd47dcf','4e306bb65d74102db266505f95b2188b92c4dfadc4c509d90139a03400da27be','2023-11-10 19:53:02.721','20231031061820_remove_from_date_from_field_booked_hours',NULL,NULL,'2023-11-10 19:53:02.692',1),('6dd90841-9e95-4977-82ff-55f268b98b45','be52b0de96443d4f03820262330ece6377b9984e370cca7f0f7e739e5ce46aed','2023-11-10 19:53:01.971','20231014131844_add_available_week_days_and_day_hours_to_fields',NULL,NULL,'2023-11-10 19:53:01.940',1),('73b4157f-b0c2-45ef-bda7-d846d7472f4d','9b8edde69a8d9a08eb6d5a466b8e84cfe4ab8693a9555087b9d99edc0e9a708a','2023-11-29 13:27:25.455','20231127202447_user_default_type',NULL,NULL,'2023-11-29 13:27:25.412',1),('77ba769a-ca24-4e32-af31-32080f26fc1a','2449ac362a98126735d524b84a682fd059b74722d857a66dd295c301195ca0f7','2023-11-10 19:53:03.717','20231103085410_add_user_id_to_rate_table',NULL,NULL,'2023-11-10 19:53:03.616',1),('7ad79a2d-b0c8-483a-a3f9-c7368cd77d05','f0567fac5518a482df9b5466d88cce5aa01ef9c93a2aba5e2be944282e057746','2023-10-09 10:12:42.873','20230923111653_add_child_id_to_child_profile',NULL,NULL,'2023-10-09 10:12:42.748',1),('7efd772d-1dc6-4f4c-97f6-0152fc9ac233','c80b43bd0e6a1aef69c5261b20a779996b76b573d95d336d66436bd06b30b8b0','2023-11-29 13:27:23.998','20231113095035_create_month_table',NULL,NULL,'2023-11-29 13:27:23.968',1),('807a3900-bb94-4f20-89e1-b63c7ef7bdb8','a542fea0febdcbfc64fdeae6910d5578778b028f71a3c4d1e3fadf1798a02261','2023-10-26 09:07:31.351','20231026062559_create_otp_table',NULL,NULL,'2023-10-26 09:07:31.318',1),('86136024-6a1e-4942-92a6-52994d5f5832','e6dfc81e6fba1a5302965d8117c83431c2d27961b8b7e920fdc6b3294026009a','2023-11-29 13:27:23.811','20231112150037_add_time_to_slot',NULL,NULL,'2023-11-29 13:27:23.781',1),('88786cfb-82b8-4d43-b690-476d6a64ddc0','1a546e311719be7e20c16500952c7187af1e4f98f09cafd2e02aebb3aa2dc51e','2023-10-09 10:12:43.481','20230926072134_add_profile_image_to_user_and_child',NULL,NULL,'2023-10-09 10:12:43.413',1),('8a62f36d-d074-4053-931b-63bbd7a50ea1','3292dee5853b6373cac62c196fd6b58764dc3fc8d3da8a0e7cd2ac64da74eced','2023-10-09 10:12:42.610','20230921174721_allow_null_in_player_profile',NULL,NULL,'2023-10-09 10:12:42.538',1),('8a6f3702-28fa-4551-bfc9-5e20fc7379c3','fe42ff38bf1c875f5f82cc2a0d61dca3f49111561807a9d17bfec13bdef53319','2023-11-29 13:27:24.764','20231118225157_add_field_id_to_slot',NULL,NULL,'2023-11-29 13:27:24.654',1),('8acf7711-6cf4-4b79-b75d-aab7977739c1','aae7b7c5cc4514b5a3757f9a3cc3dc913fe2b6bc64aa39a1a40fd23a9e2ea01c','2023-10-09 10:12:42.324','20230921040255_add_sports_to_player_profiles',NULL,NULL,'2023-10-09 10:12:42.165',1),('8c642abb-13a2-46d0-af32-236d0a00c1ff','fcdf9959afaea86801aaca77302a805003f0a711adf5284f5bcb1b6f86ec6aaa','2023-11-10 19:53:02.642','20231025125618_add_added_by_user_id_to_field',NULL,NULL,'2023-11-10 19:53:02.517',1),('8ee04eaa-0d4f-4b32-8db6-fa84a0b24545','498d4bd62f5ea371ed7718252199180541764f5a7f26c5ee0750ce66ef04ce84','2023-11-10 19:53:03.885','20231103085535_null_not_accepted_to_user_id_in_rate_table',NULL,NULL,'2023-11-10 19:53:03.731',1),('9dc4d3a3-58e8-440c-aa77-abf5e4553a45','5a7c3a795c6a3a49a3c05d3948872dc4af5de1c564acb6032ea5a98ae6fb6270','2023-10-09 10:12:42.533','20230921084954_add_created_at_and_updated_at_to_all',NULL,NULL,'2023-10-09 10:12:42.328',1),('a10734c1-3f9f-41a7-af32-8f040b0f048b','217894aa695120ce4f3e2495b25032f509e6abda1907cfcf640e3a8c706886d0','2023-10-09 10:12:41.936','20230920141337_create_region',NULL,NULL,'2023-10-09 10:12:41.902',1),('a454523b-4dc6-4336-90bb-c7e5fdf89da4','03979f132f25e83d5616c30733087475432065f9ea2da41a3613f1b63c7e0746','2023-09-26 14:22:12.630','20230905185852_init',NULL,NULL,'2023-09-26 14:22:12.589',1),('a754f020-bc95-4e47-b752-ad2eb54a15d0','bdd9290b25d9ce3c6e250a246dd4dc3fadcb72875412a98ec3ed26f873f74c8d','2023-11-29 13:27:23.866','20231112150851_make_name_not_mandatory_in_slot',NULL,NULL,'2023-11-29 13:27:23.816',1),('a77100b1-5bb1-49d7-9f0f-a6fe5d27f5ba','dc6f3e2068a3f2939cd9f93c135095a4732459e468cbb8e5d1605b52c8858bb7','2023-11-29 13:27:25.408','20231127091924_add_is_activated_to_user',NULL,NULL,'2023-11-29 13:27:25.341',1),('a8a0ffb2-ffab-468e-b864-6106e910ae03','27f812942b2f5cd44cc8519477703805aedcf981b95a60c92becffc109cb2b6e','2023-10-26 09:07:31.408','20231026063228_add_created_at_and_updated_at_to_otp',NULL,NULL,'2023-10-26 09:07:31.357',1),('ae15f465-6d0d-4fbc-af50-61bd5f0e9cf0','9beed2da76b11fec30590399bd613e844e2cf300ea4bfdc1bd87401a182777bb','2023-10-09 10:12:43.244','20230924110506_add_created_at_and_updated_at_to_trainer_profile',NULL,NULL,'2023-10-09 10:12:43.188',1),('b13dba05-9454-4830-a4ef-1901743ac7e5','7fa247f4ea21117cedfc2f517dd916183a2051f900aac323195b463a8efe998d','2023-11-10 19:53:02.233','20231022052030_add_gmt_to_field_booked_hours',NULL,NULL,'2023-11-10 19:53:02.205',1),('b28e8a98-4373-4c3f-a74b-d1333ad79075','3ac30cde803e96f8b37abb1250e616ff932c050dea16a072d3f469f8e3d15f65','2023-09-26 14:22:12.821','20230907161650_remove_otp_and_otp_expire_date',NULL,NULL,'2023-09-26 14:22:12.784',1),('be14492f-850a-4a55-b440-d6d8d79276bf','15d28a0573da78fcc768cca04ebcfaa90ad38a3b5bbe444f5e9cad0f87291775','2023-11-29 13:27:24.326','20231114123720_add_created_at_to_schedules',NULL,NULL,'2023-11-29 13:27:24.196',1),('c1b5266b-7b87-4778-86fa-bd03f9013e93','412c2ce48342af1242ffe5219d5bfbb9dc375c5589ff9b5fd7fdffe073f1dbe0','2023-09-26 14:22:12.995','20230914112339_childs_user_relation',NULL,NULL,'2023-09-26 14:22:12.825',1),('c32d9dc6-0c71-4462-9943-a80c42442db7','862cfacf9ee2b364f44f086aea958a70737a937ab30146e385f044eb2360973b','2023-11-10 19:53:02.201','20231017122730_add_to_time_to_field_booked_hours',NULL,NULL,'2023-11-10 19:53:02.140',1),('c6ce2aa5-b6df-468b-ac2a-e4495b17f8c5','e611f13196c7736ecd10e4419181f2b6b2e6d2c7daa560f8055062387e3690f5','2023-10-23 15:08:51.182','20231023143135_user_fields_not_mandatory',NULL,NULL,'2023-10-23 15:08:51.092',1),('c7781506-1764-4df6-bd91-71bc81b3ab38','6503e604704eab5c8481f2953cf3f71ca456203f2b483b0ed81893f99d93d4e0','2023-11-10 19:53:03.444','20231102122500_add_fcm_token_to_user',NULL,NULL,'2023-11-10 19:53:03.391',1),('c94f8c1e-e544-4c85-be88-c8b434b87052','c40967ae8bc462468e2612c673fdde9b4f8da6354d2ff995c5ee6f288a2c9b6e','2023-10-26 09:07:31.497','20231026075306_make_password_nullable_in_user',NULL,NULL,'2023-10-26 09:07:31.413',1),('c96a058a-f077-470e-834c-357c1578c7bb','6de201b6adf13dab1c916af472e3bec3f7ae1569e21d1d8c3b1b157190e90738','2023-11-10 19:53:03.166','20231031213114_create_doctor_clininc_table_and_not_available_days_and_booked_hours_tables',NULL,NULL,'2023-11-10 19:53:02.725',1),('d4aca7e3-ac47-48ab-8057-f62a9f4cfef0','579ef74cbc3769ac7bb04ae9a54251a53b418aff0e531e61e47ff283f8d5294d','2023-11-29 13:27:24.946','20231120032944_add_region_to_trainer_profile',NULL,NULL,'2023-11-29 13:27:24.832',1),('d84f74e6-a6ab-4209-bbaf-061672feadb0','4e306bb65d74102db266505f95b2188b92c4dfadc4c509d90139a03400da27be','2023-11-10 19:53:02.134','20231016160353_remove_to_time_from_field_booked_hours',NULL,NULL,'2023-11-10 19:53:02.095',1),('d9f17087-6a20-4f3e-abb1-4252a77b7938','8a342ebb5696335a973452b3c2c3ed8b64e85d4729df5d4e6e4366d616df22b2','2023-11-10 19:53:03.386','20231031221155_change_name_of_doctor_clinincs_booked_hours',NULL,NULL,'2023-11-10 19:53:03.171',1),('de9dfb50-c9e0-4202-8ef3-84919dc67b3b','f3f15c50361565a49990e67a220d7fc92c1156ab56f38fe115c7edf5125cca0a','2023-11-29 13:27:25.025','20231120071357_set_level_null_in_trainer_profile',NULL,NULL,'2023-11-29 13:27:24.951',1),('deb3f9d2-31d5-46d3-8299-28aa7d48c39a','d900e010b72631a45888127b3cdf249652b013e2a03e16d181d3fbd20b8f51e0','2023-10-09 10:12:43.409','20230926071624_add_sports_to_trainer_profile',NULL,NULL,'2023-10-09 10:12:43.248',1),('df7e9407-5097-4ba6-ab4d-86eba4b14935','fe0b478b8bebfb1d7058342ff329bce372418f757d7607409327e0ccb1e95130','2023-12-06 20:53:43.375','20231206202236_add_updated_at_to_rest_of_tables',NULL,NULL,'2023-12-06 20:53:42.838',1),('dfb78095-daf4-46b2-8c28-160b09d657be','2b6504b12c6d0db6bb869a0d34fd6d61f1f9d3899221c973f4d438333b55ad13','2023-10-09 10:12:43.032','20230923112228_add_sports_to_child_profile',NULL,NULL,'2023-10-09 10:12:42.878',1),('e285e405-3597-4fe4-8b6b-3cd1835cb2e5','5bc1e5e14a3880e62ca3e411a5a9efd2a2f852afc9c54efe06b5ea00645929ae','2023-09-26 14:22:12.780','20230907091007_default_nulls_in_user',NULL,NULL,'2023-09-26 14:22:12.723',1),('e5ed6f5e-dcf0-4f3a-ae62-e21388462abd','a727c4b864b211341a95fcd5aa132f4255c9d75db3395ba4bdb39c14e5cbde37','2023-10-09 10:12:43.078','20230924110218_create_trainer_profile',NULL,NULL,'2023-10-09 10:12:43.036',1),('eb254a68-6d3b-45cd-bc10-b81d6bf9b4e6','4e14c1bb3daf74a5f14b00f1e2ddcf6b738d4ab7b5089fcbb1b357b403f0ce77','2023-11-29 13:27:25.494','20231127204748_unique_constrain_on_parents_and_childs',NULL,NULL,'2023-11-29 13:27:25.460',1),('ec5ba271-e44c-4f9f-9659-8b52173313ff','a402fc18d2ec89e72256694c7cfe70d2aa978b83db6289279df8915ba310b648','2023-10-09 10:12:42.118','20230920141757_add_level_to_player_profile',NULL,NULL,'2023-10-09 10:12:42.088',1),('f18f7149-3196-4030-93f8-6c24f7b75d6d','84f5bef492289bcc201c5e4c869a620187e739845427209eb42432fb397f2c39','2023-10-09 10:12:42.648','20230923105423_create_child_profile',NULL,NULL,'2023-10-09 10:12:42.615',1),('f834b34f-c1ed-48cb-9e9e-ad8e9457799d','c77f2cdba0d18ab9218cbf226b4fc873ff8719bf7c0aafb326e4b2f04f08ea5b','2023-10-09 10:12:42.083','20230920141702_create_sport',NULL,NULL,'2023-10-09 10:12:42.044',1),('fa40f8aa-8ddf-492e-bda0-bf12d4fb6ec2','49ef869910701c1d91ba9f404b96da3534e6bda1f301271a4f472c6547a392e5','2023-11-10 19:53:02.090','20231015104818_add_not_available_days_to_fields',NULL,NULL,'2023-11-10 19:53:01.975',1),('fbc7e623-eb1d-440c-b36c-1651fa597fbf','057d5b8d5a27249d7da90b38e92f39b5127465cb020fe3d00ebc0dfcf4b56249','2023-11-29 13:27:23.777','20231112144113_remove_month_column_from_schedule',NULL,NULL,'2023-11-29 13:27:23.748',1),('fce4d68b-1442-4c1a-bfff-f2fdb29cb92e','2ee876437c5754083e9e5816feb95ec6a91f02b54dba7dd7e893fb9fd42aba20','2023-11-29 13:27:24.406','20231116110105_change_datatype_of_time_in_slot_table',NULL,NULL,'2023-11-29 13:27:24.330',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-20 12:25:52
