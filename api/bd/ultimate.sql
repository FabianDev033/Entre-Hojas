-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'fabian','2657211004','Guayaquil 66, D5732 Villa Mercedes'),(2,'fayan','2657232323','Guayaquil 66, D5732 Villa Mercedes'),(3,'Lucia Fernandez','265 410 2381','Belgrano 124, D5732 Villa Mercedes'),(4,'Matias Gomez','265 433 9012','Pueyrredon 842, D5732 Villa Mercedes'),(5,'Camila Rodriguez','265 512 7740','Pringles 315, D5732 Villa Mercedes'),(6,'Santiago Lopez','265 621 4455','Lavalle 1290, D5732 Villa Mercedes'),(7,'Valentina Diaz','265 478 2301','San Martin 455, D5700 San Luis'),(8,'Nicolas Romero','265 555 8122','Junin 720, D5700 San Luis'),(9,'Martina Acosta','265 398 4410','Colon 183, D5732 Villa Mercedes'),(10,'Tomas Benitez','265 601 9277','Mitre 1015, D5700 San Luis'),(11,'Agustina Pereyra','265 477 6102','Buenos Aires 640, D5732 Villa Mercedes'),(12,'Federico Castro','265 589 3308','Rivadavia 224, D5700 San Luis'),(13,'Sofia Molina','265 420 7654','Belgrano 930, D5732 Villa Mercedes'),(14,'Joaquin Sosa','265 612 1840','25 de Mayo 512, D5700 San Luis'),(15,'Julieta Navarro','265 451 2988','Tucuman 388, D5732 Villa Mercedes'),(16,'Benjamin Torres','265 533 7100','Pringles 1450, D5700 San Luis'),(17,'Renata Silva','265 390 5542','Mitre 276, D5732 Villa Mercedes'),(18,'Franco Herrera','265 624 8811','Pueyrredon 105, D5700 San Luis'),(19,'Mia Gonzalez','265 441 6732','Lavalle 721, D5732 Villa Mercedes'),(20,'Juan Cruz Ramirez','265 578 2090','San Martin 1180, D5700 San Luis'),(21,'Paula Vazquez','265 409 1187','Pringles 560, D5732 Villa Mercedes'),(22,'Agustin Morales','265 602 7731','Belgrano 1475, D5700 San Luis'),(23,'Clara Rios','265 485 6620','Colon 830, D5732 Villa Mercedes'),(24,'Facundo Luna','265 530 9412','Mitre 640, D5700 San Luis'),(25,'Florencia Suarez','265 397 2210','General Paz 255, D5732 Villa Mercedes'),(26,'Martin Ortiz','265 615 4803','Rivadavia 980, D5700 San Luis'),(27,'Abril Medina','265 426 7501','Maipu 415, D5732 Villa Mercedes'),(28,'Gonzalo Vega','265 549 3302','Junin 1125, D5700 San Luis'),(29,'Carolina Arias','265 388 6144','Tucuman 760, D5732 Villa Mercedes'),(30,'Lucas Correa','265 620 5530','Buenos Aires 1210, D5700 San Luis'),(31,'Pilar Cabrera','265 433 8719','San Martin 315, D5732 Villa Mercedes'),(32,'Maximiliano Flores','265 596 2408','Pringles 1090, D5700 San Luis'),(33,'Daniela Martin','265 412 3088','Belgrano 510, D5732 Villa Mercedes'),(34,'Leandro Fernandez','265 438 7210','Mitre 840, D5700 San Luis'),(35,'Nadia Gimenez','265 521 4490','Pringles 220, D5732 Villa Mercedes'),(36,'Pablo Suarez','265 604 1822','Colon 1160, D5700 San Luis'),(37,'Mariana Ruiz','265 477 9031','San Martin 735, D5732 Villa Mercedes'),(38,'Sebastian Acosta','265 591 3370','Rivadavia 420, D5700 San Luis'),(39,'Carla Romero','265 409 5512','Lavalle 915, D5732 Villa Mercedes'),(40,'Diego Torres','265 623 7741','Junin 310, D5700 San Luis'),(41,'Ana Paula Castro','265 453 2290','Pueyrredon 650, D5732 Villa Mercedes'),(42,'Ramiro Lopez','265 582 4417','Tucuman 1040, D5700 San Luis'),(43,'Valeria Molina','265 398 6610','Belgrano 1320, D5732 Villa Mercedes'),(44,'Ezequiel Rios','265 615 2304','Maipu 580, D5700 San Luis'),(45,'Noelia Sosa','265 421 8742','General Paz 390, D5732 Villa Mercedes'),(46,'Marcos Benitez','265 549 1021','Buenos Aires 875, D5700 San Luis'),(47,'Victoria Herrera','265 477 3188','San Martin 112, D5732 Villa Mercedes'),(48,'Juan Manuel Diaz','265 631 4490','Pringles 920, D5700 San Luis'),(49,'Rocio Perez','265 405 7701','Mitre 1440, D5732 Villa Mercedes'),(50,'Ignacio Gonzalez','265 593 2810','Colon 715, D5700 San Luis'),(51,'Malena Ortiz','265 426 5902','Lavalle 330, D5732 Villa Mercedes'),(52,'Hernan Cabrera','265 610 8320','Rivadavia 1215, D5700 San Luis'),(53,'Bianca Flores','265 442 1760','Belgrano 765, D5732 Villa Mercedes'),(54,'Cristian Vega','265 557 4032','Junin 980, D5700 San Luis'),(55,'Lara Medina','265 391 6844','Pueyrredon 290, D5732 Villa Mercedes'),(56,'Alejandro Arias','265 625 7103','Tucuman 610, D5700 San Luis'),(57,'Sabrina Correa','265 418 2930','Pringles 1240, D5732 Villa Mercedes'),(58,'Nicolas Cabrera','265 582 9011','San Martin 480, D5700 San Luis'),(59,'Agostina Luna','265 437 5520','Mitre 370, D5732 Villa Mercedes'),(60,'Federico Vega','265 604 1188','Buenos Aires 1050, D5700 San Luis'),(61,'Micaela Silva','265 411 7704','Colon 460, D5732 Villa Mercedes'),(62,'Damian Morales','265 639 2250','Rivadavia 830, D5700 San Luis'),(63,'padalustro man2','52127891258','Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes'),(64,'Datos de demostracion - grafico',NULL,'Sin direccion'),(65,'elmegapediardo','2657272727','Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes'),(66,'pablo aguilar','14271247','Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes'),(67,'test datos','2657211004','Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes'),(68,'gero panchin','51271725','Madre Cabrini 232, D5732 Villa Mercedes, San Luis, Villa Mercedes'),(69,'sorete maximo','125612566','Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes'),(70,'Maia','261247812784','Italia 222, D5732 Villa Mercedes, San Luis, Argentina, Villa Mercedes'),(72,'elpayasogei','126416412','Italia 222, D5732 Villa Mercedes, San Luis, Argentina, Villa Mercedes'),(73,'super payacleta','152125','Italia 222, D5732 Villa Mercedes, San Luis, Argentina, Villa Mercedes'),(74,'basofib','1249824','Italia 222, D5732 Villa Mercedes, San Luis, Argentina, Villa Mercedes'),(75,'marcos gagabriel colombia moños','2667666667','Dr. Roberto Negre, D5730 Villa Mercedes, San Luis, Villa Mercedes'),(76,'opiuasufiopaouisf','124571924978','Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `proveedor` varchar(100) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `observaciones` text,
  `anulada` tinyint(1) NOT NULL DEFAULT '0',
  `stock_aplicado` tinyint(1) NOT NULL DEFAULT '0',
  `version` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
INSERT INTO `compras` VALUES (1,'2026-05-03','Vivero El Algarrobo',85000.00,'Compra de plantas para reposición de stock',0,0,1),(2,'2026-05-08','Macetas San Luis',72000.00,'Reposición de macetas de distintos tamaños',0,0,1),(3,'2026-05-14','Sustratos del Centro',54000.00,'Compra de sustrato y tierra abonada',0,0,1),(4,'2026-05-21','Vivero El Algarrobo',110000.00,'Compra de plantas de interior',0,0,1),(5,'2026-05-28','Macetas San Luis',96000.00,'Compra de macetas plásticas',0,0,1),(6,'2026-06-04','Agroinsumos VM',67500.00,'Fertilizantes y productos para mantenimiento',0,0,1),(7,'2026-06-11','Vivero Los Aromos',125000.00,'Compra de plantas para ampliar variedad',0,0,1),(8,'2026-06-18','Macetas San Luis',83000.00,'Reposición de macetas',0,0,1),(9,'2026-06-24','Sustratos del Centro',61000.00,'Compra de sustrato y perlita',0,0,1),(10,'2026-06-29','Agroinsumos VM',48000.00,'Herramientas e insumos varios',0,0,1),(11,'2026-08-20','Padalustro VM',20000.00,'Testing total',1,0,2),(16,'2026-10-22','Loma Verde',7500.00,'Compra plantas para dupe',0,1,1);
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras_detalle`
--

DROP TABLE IF EXISTS `compras_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `tipo` enum('planta','maceta','insumo','herramienta','otro') NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `planta_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `compra_id` (`compra_id`),
  KEY `planta_id` (`planta_id`),
  CONSTRAINT `compras_detalle_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`),
  CONSTRAINT `compras_detalle_ibfk_2` FOREIGN KEY (`planta_id`) REFERENCES `plantas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras_detalle`
--

LOCK TABLES `compras_detalle` WRITE;
/*!40000 ALTER TABLE `compras_detalle` DISABLE KEYS */;
INSERT INTO `compras_detalle` VALUES (1,1,'Monstera deliciosa','planta',10,4500.00,45000.00,1),(2,1,'Potus','planta',10,2500.00,25000.00,2),(3,1,'Maceta plástica 20cm','maceta',10,1500.00,15000.00,NULL),(4,2,'Maceta plástica 15cm','maceta',20,1200.00,24000.00,NULL),(5,2,'Maceta plástica 20cm','maceta',20,1800.00,36000.00,NULL),(6,2,'Maceta cerámica 15cm','maceta',5,2400.00,12000.00,NULL),(7,3,'Sustrato universal 20L','insumo',10,3200.00,32000.00,NULL),(8,3,'Perlita 5L','insumo',5,2200.00,11000.00,NULL),(9,3,'Tierra abonada 10L','insumo',5,2200.00,11000.00,NULL),(10,4,'Sansevieria','planta',10,5000.00,50000.00,3),(11,4,'Calathea','planta',10,4500.00,45000.00,4),(12,4,'Maceta plástica 20cm','maceta',10,1500.00,15000.00,NULL),(13,5,'Maceta plástica 25cm','maceta',20,2400.00,48000.00,NULL),(14,5,'Maceta plástica 30cm','maceta',10,3000.00,30000.00,NULL),(15,5,'Maceta cerámica 20cm','maceta',5,3600.00,18000.00,NULL),(16,6,'Fertilizante líquido 1L','insumo',5,6500.00,32500.00,NULL),(17,6,'Fertilizante granulado 1kg','insumo',5,4500.00,22500.00,NULL),(18,6,'Guantes de jardinería','otro',5,500.00,2500.00,NULL),(19,7,'Pothos Marble Queen','planta',10,4500.00,45000.00,5),(20,7,'Philodendron Brasil','planta',10,5000.00,50000.00,6),(21,7,'Maceta plástica 20cm','maceta',10,3000.00,30000.00,NULL),(22,8,'Maceta plástica 15cm','maceta',20,1400.00,28000.00,NULL),(23,8,'Maceta plástica 25cm','maceta',15,2500.00,37500.00,NULL),(24,8,'Maceta cerámica 15cm','maceta',5,3500.00,17500.00,NULL),(25,9,'Sustrato universal 20L','insumo',10,3500.00,35000.00,NULL),(26,9,'Perlita 5L','insumo',5,2500.00,12500.00,NULL),(27,9,'Fibra de coco 5L','insumo',5,2700.00,13500.00,NULL),(28,10,'Tijera de poda','herramienta',2,12000.00,24000.00,NULL),(29,10,'Palita de jardinería','herramienta',2,7000.00,14000.00,NULL),(30,10,'Guantes de jardinería','otro',5,2000.00,10000.00,NULL),(41,16,'para hacer hijitos','planta',3,2500.00,7500.00,4);
/*!40000 ALTER TABLE `compras_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagenes`
--

DROP TABLE IF EXISTS `imagenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagenes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(50) NOT NULL,
  `plantas_id` int NOT NULL,
  `tipo` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_imagenes_plantas_idx` (`plantas_id`),
  CONSTRAINT `fk_imagenes_plantas` FOREIGN KEY (`plantas_id`) REFERENCES `plantas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenes`
--

LOCK TABLES `imagenes` WRITE;
/*!40000 ALTER TABLE `imagenes` DISABLE KEYS */;
INSERT INTO `imagenes` VALUES (1,'AnturioRojo',1,'icon'),(2,'CalatheaTriostar',2,'icon'),(3,'MarantaLeuconeura',3,'icon'),(4,'MonsteraAdansonii',4,'icon'),(5,'MonsteraDeliciosa',5,'icon'),(6,'PotusComun',6,'icon'),(7,'PotusNjoy',7,'icon'),(8,'PotusMarbleQueen',8,'icon'),(9,'PotusLemon',9,'icon'),(10,'PotusVariegado',10,'icon'),(11,'SingonioComun',11,'icon'),(12,'SingonioPuntaDeFlecha',12,'icon'),(13,'SingonioVariegado',13,'icon'),(14,'SingonioMaria',14,'icon'),(15,'SingonioRosado',15,'icon'),(16,'MonsteraAdansonii1',4,'detail'),(17,'MonsteraAdansonii2',4,'detail');
/*!40000 ALTER TABLE `imagenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_statistics`
--

DROP TABLE IF EXISTS `monthly_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_statistics` (
  `month` date NOT NULL,
  `sales` decimal(12,2) NOT NULL DEFAULT '0.00',
  `orders` int unsigned NOT NULL DEFAULT '0',
  `confirmed_orders` int unsigned NOT NULL DEFAULT '0',
  `average_order_value` decimal(12,2) NOT NULL DEFAULT '0.00',
  `purchases` decimal(12,2) NOT NULL DEFAULT '0.00',
  `profit` decimal(12,2) NOT NULL DEFAULT '0.00',
  `pending_orders` int unsigned NOT NULL DEFAULT '0',
  `ready_orders` int unsigned NOT NULL DEFAULT '0',
  `shipped_orders` int unsigned NOT NULL DEFAULT '0',
  `cancelled_orders` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_statistics`
--

LOCK TABLES `monthly_statistics` WRITE;
/*!40000 ALTER TABLE `monthly_statistics` DISABLE KEYS */;
INSERT INTO `monthly_statistics` VALUES ('2026-05-01',44300.00,15,3,14766.67,417000.00,-372700.00,3,3,3,3,'2026-08-20 16:00:28'),('2026-06-01',68650.00,15,3,22883.33,384500.00,-315850.00,3,3,3,3,'2026-08-20 16:00:28'),('2026-07-01',563200.00,29,25,22528.00,0.00,563200.00,2,1,1,0,'2026-08-20 18:37:09'),('2026-08-01',988650.00,44,31,31891.94,20000.00,968650.00,7,2,2,2,'2026-09-01 13:22:41'),('2026-09-01',20300.00,4,2,10150.00,0.00,20300.00,0,1,0,1,'2026-10-02 00:01:03'),('2026-10-01',0.00,2,0,0.00,7500.00,-7500.00,1,1,0,0,'2026-11-03 16:19:55');
/*!40000 ALTER TABLE `monthly_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden_detalle`
--

DROP TABLE IF EXISTS `orden_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden_detalle` (
  `plantas_id` int NOT NULL,
  `ordenes_id` int NOT NULL,
  `cantidad` int DEFAULT NULL,
  `precio unitario` varchar(45) DEFAULT NULL,
  KEY `fk_orden_detalle_plantas1_idx` (`plantas_id`),
  KEY `fk_orden_detalle_ordenes1_idx` (`ordenes_id`),
  CONSTRAINT `fk_orden_detalle_ordenes1` FOREIGN KEY (`ordenes_id`) REFERENCES `ordenes` (`id`),
  CONSTRAINT `fk_orden_detalle_plantas1` FOREIGN KEY (`plantas_id`) REFERENCES `plantas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_detalle`
--

LOCK TABLES `orden_detalle` WRITE;
/*!40000 ALTER TABLE `orden_detalle` DISABLE KEYS */;
INSERT INTO `orden_detalle` VALUES (4,1,1,'6650'),(6,2,2,'7000'),(5,2,1,'10000'),(1,3,1,'7000'),(2,4,2,'7000'),(5,4,1,'10000'),(3,5,1,'6650'),(8,5,1,'9000'),(4,6,2,'6650'),(6,6,1,'7000'),(10,6,1,'7000'),(7,7,1,'8100'),(12,7,1,'9000'),(9,8,2,'8000'),(11,9,1,'7000'),(14,9,1,'8000'),(13,10,1,'9000'),(15,10,2,'7000'),(5,11,1,'10000'),(7,11,1,'8100'),(9,11,1,'8000'),(1,12,2,'7000'),(4,12,1,'6650'),(2,13,1,'7000'),(6,13,2,'7000'),(8,14,1,'9000'),(10,14,1,'7000'),(11,14,1,'7000'),(12,15,2,'9000'),(14,16,1,'8000'),(15,16,1,'7000'),(3,16,1,'6650'),(5,17,2,'10000'),(13,17,1,'9000'),(6,18,1,'7000'),(9,18,1,'8000'),(7,19,2,'8100'),(8,19,1,'9000'),(10,20,2,'7000'),(11,20,1,'7000'),(1,21,1,'7000'),(12,21,1,'9000'),(15,21,1,'7000'),(2,22,2,'7000'),(14,22,1,'8000'),(3,23,2,'6650'),(4,23,1,'6650'),(5,24,1,'10000'),(6,24,1,'7000'),(7,24,1,'8100'),(8,25,2,'9000'),(13,25,1,'9000'),(9,26,1,'8000'),(10,26,1,'7000'),(15,26,1,'7000'),(11,27,2,'7000'),(12,27,1,'9000'),(1,28,1,'7000'),(5,28,1,'10000'),(14,28,1,'8000'),(2,29,1,'7000'),(7,29,1,'8100'),(13,29,1,'9000'),(3,30,1,'6650'),(6,30,1,'7000'),(8,30,1,'9000'),(10,30,1,'7000'),(4,31,1,'6650'),(9,31,1,'8000'),(11,31,1,'7000'),(12,32,1,'9000'),(14,32,1,'8000'),(15,32,2,'7000'),(1,33,1,'7000'),(2,34,2,'7000'),(5,34,1,'10000'),(3,35,1,'6650'),(8,35,1,'9000'),(4,36,2,'6650'),(7,37,1,'8100'),(10,37,1,'7000'),(9,38,1,'8000'),(12,38,1,'9000'),(11,39,2,'7000'),(15,39,1,'7000'),(5,40,1,'10000'),(6,40,1,'7000'),(14,40,1,'8000'),(2,41,1,'7000'),(13,41,1,'9000'),(4,42,1,'6650'),(7,42,1,'8100'),(9,42,1,'8000'),(1,43,2,'7000'),(12,43,1,'9000'),(8,44,2,'9000'),(10,44,1,'7000'),(3,45,2,'6650'),(5,45,1,'10000'),(6,46,1,'7000'),(14,46,1,'8000'),(7,47,2,'8100'),(11,47,1,'7000'),(9,48,1,'8000'),(15,48,2,'7000'),(2,49,1,'7000'),(4,49,1,'6650'),(13,49,1,'9000'),(5,50,2,'10000'),(8,50,1,'9000'),(1,51,1,'7000'),(6,51,2,'7000'),(10,52,2,'7000'),(12,52,1,'9000'),(3,53,1,'6650'),(7,53,1,'8100'),(14,53,1,'8000'),(11,54,1,'7000'),(13,54,1,'9000'),(4,55,2,'6650'),(15,55,1,'7000'),(5,56,1,'10000'),(9,56,1,'8000'),(10,56,1,'7000'),(2,57,2,'7000'),(8,57,1,'9000'),(6,58,1,'7000'),(12,58,1,'9000'),(15,58,1,'7000'),(1,59,1,'7000'),(7,59,1,'8100'),(13,59,1,'9000'),(3,60,1,'6650'),(5,60,1,'10000'),(14,60,1,'8000'),(4,61,1,'6650'),(8,61,1,'9000'),(11,61,1,'7000'),(9,62,2,'8000'),(12,62,1,'9000'),(10,62,1,'7000'),(4,63,1,'6650'),(6,104,9,'7000'),(2,104,1,'7000'),(10,104,6,'7000'),(4,105,1,'6650'),(6,105,1,'7000'),(4,106,1,'6650'),(4,107,1,'6650'),(4,108,4,'6650'),(4,109,2,'6650'),(4,111,1,'6650'),(4,112,1,'6650'),(4,113,1,'6650'),(4,114,1,'6650'),(14,114,1,'8000'),(9,114,6,'8000'),(4,115,1,'6650');
/*!40000 ALTER TABLE `orden_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes`
--

DROP TABLE IF EXISTS `ordenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `estado_actualizado` datetime DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `clientes_id` int NOT NULL,
  `direccion_entrega` text,
  `detalle_ubicacion` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `medio_pago` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ordenes_clientes1_idx` (`clientes_id`),
  CONSTRAINT `fk_ordenes_clientes1` FOREIGN KEY (`clientes_id`) REFERENCES `clientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes`
--

LOCK TABLES `ordenes` WRITE;
/*!40000 ALTER TABLE `ordenes` DISABLE KEYS */;
INSERT INTO `ordenes` VALUES (1,'2026-08-08 12:21:32','listo','2026-10-07 12:22:51',6650.00,1,NULL,NULL,NULL,NULL,NULL),(2,'2026-08-09 23:23:57','cancelado','2026-09-24 16:15:01',24000.00,2,NULL,NULL,NULL,NULL,NULL),(3,'2026-07-18 10:14:00','pendiente',NULL,7000.00,3,NULL,NULL,NULL,NULL,NULL),(4,'2026-07-19 16:42:00','confirmado',NULL,24000.00,4,NULL,NULL,NULL,NULL,NULL),(5,'2026-07-20 11:08:00','listo','2026-10-08 14:33:07',15650.00,5,NULL,NULL,NULL,NULL,NULL),(6,'2026-07-22 18:31:00','pendiente',NULL,27300.00,6,NULL,NULL,NULL,NULL,NULL),(7,'2026-07-24 09:55:00','confirmado',NULL,17100.00,7,NULL,NULL,NULL,NULL,NULL),(8,'2026-07-25 14:20:00','enviado',NULL,16000.00,8,NULL,NULL,NULL,NULL,NULL),(9,'2026-07-27 12:03:00','pendiente',NULL,15000.00,9,NULL,NULL,NULL,NULL,NULL),(10,'2026-07-29 17:46:00','entregado',NULL,23000.00,10,NULL,NULL,NULL,NULL,NULL),(11,'2026-07-30 10:37:00','confirmado',NULL,26100.00,11,NULL,NULL,NULL,NULL,NULL),(12,'2026-08-01 15:12:00','pendiente','2026-09-17 10:28:12',20650.00,12,NULL,NULL,NULL,NULL,NULL),(13,'2026-08-02 11:29:00','entregado',NULL,21000.00,13,NULL,NULL,NULL,NULL,NULL),(14,'2026-08-03 19:05:00','confirmado','2026-09-17 10:27:17',23000.00,14,NULL,NULL,NULL,NULL,NULL),(15,'2026-08-04 09:18:00','pendiente',NULL,18000.00,15,NULL,NULL,NULL,NULL,NULL),(16,'2026-08-04 13:51:00','listo','2026-10-13 22:20:49',21650.00,16,NULL,NULL,NULL,NULL,NULL),(17,'2026-08-05 16:07:00','confirmado',NULL,29000.00,17,NULL,NULL,NULL,NULL,NULL),(18,'2026-08-06 10:45:00','cancelado',NULL,15000.00,18,NULL,NULL,NULL,NULL,NULL),(19,'2026-08-06 18:22:00','enviado','2026-10-08 22:56:51',25200.00,19,NULL,NULL,NULL,NULL,NULL),(20,'2026-08-07 12:16:00','enviado','2026-10-08 22:56:29',21000.00,20,NULL,NULL,NULL,NULL,NULL),(21,'2026-08-07 15:39:00','confirmado',NULL,23000.00,21,NULL,NULL,NULL,NULL,NULL),(22,'2026-08-08 09:47:00','enviado','2026-10-08 14:28:05',22000.00,22,NULL,NULL,NULL,NULL,NULL),(23,'2026-08-08 14:28:00','listo','2026-09-24 20:07:17',19950.00,23,NULL,NULL,NULL,NULL,NULL),(24,'2026-08-09 11:12:00','listo',NULL,25100.00,24,NULL,NULL,NULL,NULL,NULL),(25,'2026-08-09 17:35:00','enviado','2026-10-07 12:19:11',27000.00,25,NULL,NULL,NULL,NULL,NULL),(26,'2026-08-10 10:26:00','cancelado',NULL,22000.00,26,NULL,NULL,NULL,NULL,NULL),(27,'2026-08-10 13:44:00','confirmado',NULL,23000.00,27,NULL,NULL,NULL,NULL,NULL),(28,'2026-08-11 09:31:00','listo','2026-09-17 10:26:26',25000.00,28,NULL,NULL,NULL,NULL,NULL),(29,'2026-08-11 16:18:00','listo',NULL,24100.00,29,NULL,NULL,NULL,NULL,NULL),(30,'2026-08-12 11:57:00','confirmado',NULL,29650.00,30,NULL,NULL,NULL,NULL,NULL),(31,'2026-08-13 14:06:00','listo',NULL,21650.00,31,NULL,NULL,NULL,NULL,NULL),(32,'2026-08-14 18:41:00','listo','2026-09-25 19:12:05',31000.00,32,NULL,NULL,NULL,NULL,NULL),(33,'2026-05-03 10:18:00','pendiente',NULL,7000.00,33,NULL,NULL,NULL,NULL,NULL),(34,'2026-05-04 16:42:00','listo',NULL,24000.00,34,NULL,NULL,NULL,NULL,NULL),(35,'2026-05-06 11:27:00','cancelado','2026-09-17 10:47:34',15650.00,35,NULL,NULL,NULL,NULL,NULL),(36,'2026-05-08 18:15:00','confirmado',NULL,13300.00,36,NULL,NULL,NULL,NULL,NULL),(37,'2026-05-10 09:43:00','cancelado',NULL,15100.00,37,NULL,NULL,NULL,NULL,NULL),(38,'2026-05-12 14:36:00','pendiente',NULL,17000.00,38,NULL,NULL,NULL,NULL,NULL),(39,'2026-05-14 17:21:00','listo',NULL,21000.00,39,NULL,NULL,NULL,NULL,NULL),(40,'2026-05-17 10:05:00','confirmado','2026-09-22 11:50:12',25000.00,40,NULL,NULL,NULL,NULL,NULL),(41,'2026-05-19 13:48:00','confirmado',NULL,16000.00,41,NULL,NULL,NULL,NULL,NULL),(42,'2026-05-21 18:37:00','cancelado',NULL,22750.00,42,NULL,NULL,NULL,NULL,NULL),(43,'2026-05-23 11:12:00','pendiente',NULL,23000.00,43,NULL,NULL,NULL,NULL,NULL),(44,'2026-05-25 15:54:00','listo',NULL,25000.00,44,NULL,NULL,NULL,NULL,NULL),(45,'2026-05-27 10:31:00','pendiente','2026-09-17 10:27:38',23300.00,45,NULL,NULL,NULL,NULL,NULL),(46,'2026-05-29 16:18:00','confirmado',NULL,15000.00,46,NULL,NULL,NULL,NULL,NULL),(47,'2026-05-31 12:44:00','cancelado',NULL,23200.00,47,NULL,NULL,NULL,NULL,NULL),(48,'2026-06-02 09:57:00','pendiente',NULL,22000.00,48,NULL,NULL,NULL,NULL,NULL),(49,'2026-06-04 14:22:00','listo',NULL,22650.00,49,NULL,NULL,NULL,NULL,NULL),(50,'2026-06-06 17:46:00','enviado',NULL,29000.00,50,NULL,NULL,NULL,NULL,NULL),(51,'2026-06-08 11:35:00','confirmado',NULL,21000.00,51,NULL,NULL,NULL,NULL,NULL),(52,'2026-06-10 18:09:00','cancelado',NULL,23000.00,52,NULL,NULL,NULL,NULL,NULL),(53,'2026-06-12 10:24:00','pendiente',NULL,22750.00,53,NULL,NULL,NULL,NULL,NULL),(54,'2026-06-14 13:17:00','listo',NULL,16000.00,54,NULL,NULL,NULL,NULL,NULL),(55,'2026-06-16 16:51:00','enviado',NULL,20300.00,55,NULL,NULL,NULL,NULL,NULL),(56,'2026-06-18 11:06:00','listo','2026-09-17 10:28:59',25000.00,56,NULL,NULL,NULL,NULL,NULL),(57,'2026-06-20 15:38:00','cancelado',NULL,23000.00,57,NULL,NULL,NULL,NULL,NULL),(58,'2026-06-22 09:46:00','pendiente',NULL,23000.00,58,NULL,NULL,NULL,NULL,NULL),(59,'2026-06-24 14:13:00','listo',NULL,24100.00,59,NULL,NULL,NULL,NULL,NULL),(60,'2026-06-26 17:29:00','enviado',NULL,24650.00,60,NULL,NULL,NULL,NULL,NULL),(61,'2026-06-28 10:52:00','confirmado',NULL,22650.00,61,NULL,NULL,NULL,NULL,NULL),(62,'2026-06-30 16:07:00','cancelado',NULL,32000.00,62,NULL,NULL,NULL,NULL,NULL),(63,'2026-08-18 01:20:00','listo','2026-09-24 20:07:00',6650.00,63,NULL,NULL,NULL,NULL,NULL),(64,'2026-07-01 12:00:00','entregado',NULL,14000.00,64,NULL,NULL,NULL,NULL,NULL),(65,'2026-07-02 12:00:00','confirmado',NULL,21000.00,64,NULL,NULL,NULL,NULL,NULL),(66,'2026-07-03 12:00:00','confirmado',NULL,18000.00,64,NULL,NULL,NULL,NULL,NULL),(67,'2026-07-04 12:00:00','entregado',NULL,26500.00,64,NULL,NULL,NULL,NULL,NULL),(68,'2026-07-05 12:00:00','confirmado',NULL,12000.00,64,NULL,NULL,NULL,NULL,NULL),(69,'2026-07-06 12:00:00','confirmado',NULL,30000.00,64,NULL,NULL,NULL,NULL,NULL),(70,'2026-07-07 12:00:00','entregado',NULL,22500.00,64,NULL,NULL,NULL,NULL,NULL),(71,'2026-07-08 12:00:00','confirmado',NULL,16000.00,64,NULL,NULL,NULL,NULL,NULL),(72,'2026-07-09 12:00:00','confirmado',NULL,28000.00,64,NULL,NULL,NULL,NULL,NULL),(73,'2026-07-10 12:00:00','entregado',NULL,19500.00,64,NULL,NULL,NULL,NULL,NULL),(74,'2026-07-11 12:00:00','confirmado',NULL,34000.00,64,NULL,NULL,NULL,NULL,NULL),(75,'2026-07-12 12:00:00','confirmado',NULL,15000.00,64,NULL,NULL,NULL,NULL,NULL),(76,'2026-07-13 12:00:00','entregado',NULL,24000.00,64,NULL,NULL,NULL,NULL,NULL),(77,'2026-07-14 12:00:00','confirmado',NULL,31000.00,64,NULL,NULL,NULL,NULL,NULL),(78,'2026-07-15 12:00:00','confirmado',NULL,17500.00,64,NULL,NULL,NULL,NULL,NULL),(79,'2026-07-16 12:00:00','entregado',NULL,27000.00,64,NULL,NULL,NULL,NULL,NULL),(80,'2026-07-17 12:00:00','confirmado',NULL,20500.00,64,NULL,NULL,NULL,NULL,NULL),(81,'2026-07-18 12:00:00','confirmado',NULL,33000.00,64,NULL,NULL,NULL,NULL,NULL),(82,'2026-07-19 12:00:00','entregado',NULL,18500.00,64,NULL,NULL,NULL,NULL,NULL),(83,'2026-07-20 12:00:00','confirmado',NULL,29000.00,64,NULL,NULL,NULL,NULL,NULL),(84,'2026-08-01 12:00:00','entregado',NULL,26000.00,64,NULL,NULL,NULL,NULL,NULL),(85,'2026-08-02 12:00:00','confirmado',NULL,31000.00,64,NULL,NULL,NULL,NULL,NULL),(86,'2026-08-03 12:00:00','confirmado',NULL,28500.00,64,NULL,NULL,NULL,NULL,NULL),(87,'2026-08-04 12:00:00','confirmado',NULL,35500.00,64,NULL,NULL,NULL,NULL,NULL),(88,'2026-08-05 12:00:00','entregado',NULL,32000.00,64,NULL,NULL,NULL,NULL,NULL),(89,'2026-08-06 12:00:00','confirmado',NULL,39000.00,64,NULL,NULL,NULL,NULL,NULL),(90,'2026-08-07 12:00:00','confirmado',NULL,27000.00,64,NULL,NULL,NULL,NULL,NULL),(91,'2026-08-08 12:00:00','confirmado',NULL,43000.00,64,NULL,NULL,NULL,NULL,NULL),(92,'2026-08-09 12:00:00','entregado',NULL,35000.00,64,NULL,NULL,NULL,NULL,NULL),(93,'2026-08-10 12:00:00','confirmado',NULL,40500.00,64,NULL,NULL,NULL,NULL,NULL),(94,'2026-08-11 12:00:00','confirmado',NULL,29500.00,64,NULL,NULL,NULL,NULL,NULL),(95,'2026-08-12 12:00:00','confirmado',NULL,37000.00,64,NULL,NULL,NULL,NULL,NULL),(96,'2026-08-13 12:00:00','entregado',NULL,44500.00,64,NULL,NULL,NULL,NULL,NULL),(97,'2026-08-14 12:00:00','confirmado',NULL,33000.00,64,NULL,NULL,NULL,NULL,NULL),(98,'2026-08-15 12:00:00','confirmado',NULL,41000.00,64,NULL,NULL,NULL,NULL,NULL),(99,'2026-08-16 12:00:00','confirmado',NULL,36000.00,64,NULL,NULL,NULL,NULL,NULL),(100,'2026-08-17 12:00:00','entregado',NULL,47000.00,64,NULL,NULL,NULL,NULL,NULL),(101,'2026-08-18 12:00:00','confirmado',NULL,38500.00,64,NULL,NULL,NULL,NULL,NULL),(102,'2026-08-19 12:00:00','confirmado',NULL,42500.00,64,NULL,NULL,NULL,NULL,NULL),(103,'2026-08-20 12:00:00','confirmado',NULL,34000.00,64,NULL,NULL,NULL,NULL,NULL),(104,'2026-09-05 23:58:08','cancelado','2026-09-24 20:09:03',112000.00,65,NULL,NULL,NULL,NULL,NULL),(105,'2026-09-08 01:26:13','confirmado','2026-09-17 10:28:02',13650.00,66,NULL,NULL,NULL,NULL,NULL),(106,'2026-09-22 12:19:57','confirmado','2026-09-24 19:16:21',6650.00,67,'Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes','hay un auto virgo afuera jaj',-33.6943389,-65.4542444,'mercado_pago'),(107,'2026-09-24 20:12:32','listo','2026-09-24 20:14:28',6650.00,68,'Madre Cabrini 232, D5732 Villa Mercedes, San Luis, Villa Mercedes','solidario',-33.6721162,-65.4570184,'efectivo'),(108,'2026-10-01 21:03:02','listo','2026-10-08 22:56:58',26600.00,69,'Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes','micasa',-33.6943389,-65.4542444,'mercado_pago'),(109,'2026-10-09 20:06:00','pendiente','2026-10-09 20:10:42',13300.00,70,'Italia 222, D5732 Villa Mercedes, San Luis, Argentina, Villa Mercedes','hay una auto rojo',-33.6900625,-65.4609528,'mercado_pago'),(111,'2026-11-23 13:00:47','pendiente','2026-11-23 13:00:47',6650.00,72,'Italia 222, D5732 Villa Mercedes, San Luis, Argentina, Villa Mercedes','hay una auto rojo',-33.6900625,-65.4609528,'mercado_pago'),(112,'2026-11-23 14:41:18','pendiente','2026-11-23 14:41:18',6650.00,73,'Italia 222, D5732 Villa Mercedes, San Luis, Argentina, Villa Mercedes','hay una auto rojo',-33.6900625,-65.4609528,'mercado_pago'),(113,'2026-11-23 14:44:08','pendiente','2026-11-23 14:44:08',6650.00,74,'Italia 222, D5732 Villa Mercedes, San Luis, Argentina, Villa Mercedes','hay una auto rojo',-33.6900625,-65.4609528,'transferencia'),(114,'2026-11-23 15:37:40','pendiente','2026-11-23 15:37:40',62650.00,75,'Dr. Roberto Negre, D5730 Villa Mercedes, San Luis, Villa Mercedes','mi casa',-33.6804348,-65.4288958,'mercado_pago'),(115,'2026-11-23 15:49:46','pendiente','2026-11-23 15:49:46',6650.00,76,'Guayaquil 66, D5732 Villa Mercedes, San Luis, Villa Mercedes','ANNAAASHEEEE',-33.6943389,-65.4542444,'efectivo');
/*!40000 ALTER TABLE `ordenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantas`
--

DROP TABLE IF EXISTS `plantas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `familia` varchar(100) DEFAULT NULL,
  `stock` int NOT NULL,
  `habilitado` tinyint(1) NOT NULL DEFAULT '1',
  `actualizado` datetime DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `discount` int NOT NULL DEFAULT '0',
  `etiqueta` varchar(50) DEFAULT NULL,
  `etiquetas` json DEFAULT NULL,
  `origen` varchar(100) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `iluminacion` varchar(50) DEFAULT NULL,
  `resistencia` varchar(50) DEFAULT NULL,
  `tamano` varchar(50) DEFAULT NULL,
  `cuidado` text,
  `petFriendly` tinyint(1) DEFAULT NULL,
  `descripcion` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantas`
--

LOCK TABLES `plantas` WRITE;
/*!40000 ALTER TABLE `plantas` DISABLE KEYS */;
INSERT INTO `plantas` VALUES (1,'Rojo','Anturio',27,1,'2026-07-19 11:24:00',7000.00,0,'',NULL,'Desconocido','Interior','Media','Media','Mediano','Facil',NULL,'Descripcion'),(2,'Triostar','Calathea',13,1,'2026-07-23 16:42:00',7000.00,0,'',NULL,'Desconocido','Interior','Media','Media','Mediano','Facil',NULL,'Descripcion'),(3,'Leuconeura','Maranta',38,1,'2026-10-13 19:45:31',7000.00,0,'volvio','[\"volvio\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',NULL,'Descripcion'),(4,'Adansonii','Monstera',18,1,'2026-10-22 22:16:16',7000.00,5,'promo','[\"promo\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',1,'Descripcion'),(5,'Deliciosa','Monstera',46,1,'2026-10-13 19:45:13',10000.00,0,'top','[\"top\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',NULL,'Descripcion'),(6,'Comun','Potus',10,0,'2026-10-13 21:50:22',7000.00,0,'ultimo','[\"ultimo\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',NULL,'Descripcion'),(7,'N\'Joy','Potus',32,1,'2026-10-13 19:45:51',9000.00,10,'regalo','[\"regalo\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',NULL,'Descripcion'),(8,'Marble Queen','Potus',12,1,'2026-10-13 19:45:36',9000.00,0,'elegido','[\"elegido\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',NULL,'Descripcion'),(9,'Lemon','Potus',35,1,'2026-10-13 19:45:22',8000.00,0,'nuevo','[\"nuevo\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',NULL,'Descripcion'),(10,'Variegado','Potus',19,1,'2026-07-25 15:27:00',7000.00,0,'',NULL,'Desconocido','Interior','Media','Media','Mediano','Facil',NULL,'Descripcion'),(11,'Comun','Singonio',19,1,'2026-10-13 19:45:06',7000.00,0,'ultimo','[\"ultimo\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',NULL,'Descripcion'),(12,'Punta de flecha','Singonio',35,1,'2026-08-01 12:18:00',10000.00,10,'top',NULL,'Desconocido','Interior','Media','Media','Mediano','Facil',NULL,'Descripcion'),(13,'Variegado','Singonio',48,1,'2026-07-18 16:06:00',9000.00,0,'oferta',NULL,'Desconocido','Interior','Media','Media','Mediano','Facil',NULL,'Descripcion'),(14,'Maria','Singonio',22,1,'2026-10-13 19:45:41',8000.00,0,'limitada','[\"limitada\"]','Desconocido','Interior','Media','Media','Mediano','Fácil',NULL,'Descripcion'),(15,'Rosado','Singonio',30,1,'2026-07-27 10:29:00',7000.00,0,'ultimo',NULL,'Desconocido','Interior','Media','Media','Mediano','Facil',NULL,'Descripcion');
/*!40000 ALTER TABLE `plantas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL,
  `user` varchar(45) DEFAULT NULL,
  `password` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','scrypt$52307a1502057501a4709ced14894995$0a015603a9bafc5c14f40bf6890edaf185d13a8110e2b29b38681aae78a10433d0c41cfcc321dd2f9e0e5501fe4daee782087cf21dc2057b2c115f00e7548cce'),(2,'gordo','scrypt$d58e3ff83113abaf6dd7b6f222559d25$05cb1df74d599e928411168c293e0ed453d854bc5fb12ea3e93836adf9f7c1a11fb0c76bcb974613763d69392a3d3c1b65390a4dced26f0e096c30c8841d4afb'),(3,'Pablo','scrypt$0919efbeb19e5bdfcee38fecda0d138e$426e60bb7d8d7d07b3fef397c26d6d4342bf6e949f7443093c65e1b4c27f59f3f38e4cb64a885780ce2a960b42486d17f0fcafdbaf934e918bc5ce0360ead83d'),(4,'pepe','scrypt$5602946d1356ddf748aa1ce21b3443a8$4cac5438f89d62acbcff34eef8215badb30f66054c91d058e4d03e538493a1aade923aab330db411c84d10a72ae4970dfcfdff31e0f5c104b3f408ea6b181afc');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-23 16:36:05
