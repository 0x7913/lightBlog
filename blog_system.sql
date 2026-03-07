-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: blog_system
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `comment_likes`
--

DROP TABLE IF EXISTS `comment_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_likes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commentId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_comment` (`userId`,`commentId`),
  UNIQUE KEY `comment_likes_user_id_comment_id` (`userId`,`commentId`),
  KEY `idx_commentlikes_userId` (`userId`),
  KEY `idx_commentlikes_commentId` (`commentId`),
  CONSTRAINT `fk_commentlikes_comment` FOREIGN KEY (`commentId`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_commentlikes_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment_likes`
--

LOCK TABLES `comment_likes` WRITE;
/*!40000 ALTER TABLE `comment_likes` DISABLE KEYS */;
INSERT INTO `comment_likes` VALUES ('ff4408d2-714d-44e5-8ca2-039ed02151f1','14031bfd-253e-484d-8166-3adca0706a9b','2e457d7f-5bb8-4f78-bf3a-bd407987d0b6','2025-11-25 17:12:53','2025-11-25 17:12:53');
/*!40000 ALTER TABLE `comment_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `replyToUsername` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_userId` (`userId`),
  KEY `idx_comments_postId` (`postId`),
  KEY `idx_comments_parentId` (`parentId`),
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES ('2e457d7f-5bb8-4f78-bf3a-bd407987d0b6','原来如此',NULL,'14031bfd-253e-484d-8166-3adca0706a9b','ef4f68cd-9728-46f0-a852-23a1d023e713',NULL,'2025-11-25 17:12:51','2025-11-25 17:12:51');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `PostId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TagId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_tags`
--

LOCK TABLES `post_tags` WRITE;
/*!40000 ALTER TABLE `post_tags` DISABLE KEYS */;
INSERT INTO `post_tags` VALUES (1,'ef4f68cd-9728-46f0-a852-23a1d023e713','226b08fd-eb4b-4b0b-84a4-c8be89c21930','2025-11-25 17:05:42','2025-11-25 17:05:42'),(2,'ef4f68cd-9728-46f0-a852-23a1d023e713','38a6a59e-bd02-4662-9f8d-2ad1af733355','2025-11-25 17:05:42','2025-11-25 17:05:42'),(3,'ef4f68cd-9728-46f0-a852-23a1d023e713','36f95d13-7be4-4e69-9e70-0e8ee4277a25','2025-11-25 17:05:42','2025-11-25 17:05:42');
/*!40000 ALTER TABLE `post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_posts_userId` (`userId`),
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES ('ef4f68cd-9728-46f0-a852-23a1d023e713','vedio标签控制自动播放的属性','最核心的属性是 **`autoplay`**，但为了应对不同浏览器的自动播放策略，通常还需要配合其他属性和设置。\n\n### 1. 核心属性：`autoplay`\n\n- **作用**：指定视频在就绪后（即加载到可以播放的程度）立即开始播放，无需用户手动触发。\n- **用法**：\n  ```html\n  <video autoplay>\n    <source src=\"movie.mp4\" type=\"video/mp4\">\n  </video>\n  ```\n  或者\n  ```html\n  <video autoplay src=\"movie.mp4\"></video>\n  ```\n\n### 2. 现代浏览器的自动播放策略\n\n由于自动播放可能影响用户体验、消耗流量，甚至被用于骚扰，**现代浏览器（如 Chrome, Safari, Firefox）对自动播放施加了严格的限制**。仅仅使用 `autoplay` 属性在很多情况下是无效的。\n\n浏览器的策略核心是：**只有在用户可能希望播放的视频上才允许自动播放。**\n\n具体来说，允许自动播放通常需要满足以下**一个或多个**条件：\n\n#### **条件一：静音播放**\n\n如果视频是**静音**的，那么几乎总是允许自动播放。\n- 实现方法：添加 `muted` 属性。\n- 这是最可靠、最常用的方法。\n\n```html\n<video autoplay muted>\n  <source src=\"movie.mp4\" type=\"video/mp4\">\n</video>\n```\n\n#### **条件二：用户已与网站交互**\n\n如果用户已经与你的网站（例如，点击、触摸、滚动）有过积极的交互，那么浏览器可能会允许带有声音的自动播放。这通常通过 JavaScript 来实现。\n\n#### **条件三：站点的“媒体参与度指数”高**\n\n如果用户经常在你的网站上观看视频（例如，像 YouTube 这样的视频网站），浏览器会记住这一点，并更可能允许自动播放。\n\n### 3. 其他相关重要属性\n\n为了成功实现自动播放，你通常需要组合使用以下属性：\n\n- **`muted`**:\n  - 如上所述，这是确保自动播放成功的关键。它将视频初始化为静音状态。\n  - 你可以通过额外的 JavaScript 代码来提供一个“取消静音”的按钮。\n\n- **`playsinline`**:\n  - **主要针对 iOS 的 Safari 浏览器**。\n  - 在 iOS 上，默认情况下，视频全屏播放。添加 `playsinline` 属性可以防止视频自动进入全屏模式，允许它在网页内容流中“内联”播放。这对于背景视频或小窗视频至关重要。\n  - 通常与 `autoplay` 和 `muted` 一起使用。\n\n```html\n<!-- 一个在移动端和桌面端都能可靠自动播放的通用写法 -->\n<video autoplay muted playsinline>\n  <source src=\"background-video.mp4\" type=\"video/mp4\">\n</video>\n```\n\n- **`loop`**:\n  - 经常与自动播放一起使用，让视频播放完毕后重新开始，常用于背景视频或动效循环。\n\n```html\n<video autoplay muted loop playsinline>\n  <source src=\"loop-background.mp4\" type=\"video/mp4\">\n</video>\n```\n\n### 总结与实践建议\n\n| 目标 | 推荐的 HTML 代码 |\n| :--- | :--- |\n| **可靠的静音自动播放** | `<video autoplay muted playsinline>...</video>` |\n| **可靠的静音循环自动播放** | `<video autoplay muted loop playsinline>...</video>` |\n\n**重要提示**：\n\n1.  **不要滥用**：即使技术上可行，也应谨慎使用自动播放。无预警的自动播放（尤其是带声音的）对用户体验非常不友好。\n2.  **提供控制**：始终为用户提供暂停或关闭声音的控件，可以添加 `controls` 属性或使用自定义控件。\n3.  **带声音的自动播放**：如果需要带声音的自动播放，通常需要通过 JavaScript 在用户交互（如点击按钮）后触发播放，因为直接使用 `autoplay` 属性大概率会被浏览器阻止。\n\n```javascript\n// 示例：通过用户点击来启动带声音的视频\ndocument.getElementById(\'playButton\').addEventListener(\'click\', function() {\n  const video = document.getElementById(\'myVideo\');\n  video.muted = false; // 取消静音\n  video.play(); // 开始播放\n});\n```','363c96f4-dde8-4209-b2b8-bb658a5c2a1c','2025-11-25 17:05:42','2025-11-25 17:05:42');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES ('226b08fd-eb4b-4b0b-84a4-c8be89c21930','vedio','2025-11-25 17:05:42','2025-11-25 17:05:42'),('36f95d13-7be4-4e69-9e70-0e8ee4277a25','html','2025-11-25 17:05:42','2025-11-25 17:05:42'),('38a6a59e-bd02-4662-9f8d-2ad1af733355','标签','2025-11-25 17:05:42','2025-11-25 17:05:42');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `userId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`postId`),
  KEY `idx_userfavorites_userId` (`userId`),
  KEY `idx_userfavorites_postId` (`postId`),
  CONSTRAINT `fk_userfavorites_post` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_userfavorites_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES ('363c96f4-dde8-4209-b2b8-bb658a5c2a1c','ef4f68cd-9728-46f0-a852-23a1d023e713',0,'2025-11-25 17:05:59','2025-11-25 17:05:59');
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_likes`
--

DROP TABLE IF EXISTS `user_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_likes` (
  `userId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`postId`),
  KEY `idx_userlikes_userId` (`userId`),
  KEY `idx_userlikes_postId` (`postId`),
  CONSTRAINT `fk_userlikes_post` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_userlikes_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_likes`
--

LOCK TABLES `user_likes` WRITE;
/*!40000 ALTER TABLE `user_likes` DISABLE KEYS */;
INSERT INTO `user_likes` VALUES ('363c96f4-dde8-4209-b2b8-bb658a5c2a1c','ef4f68cd-9728-46f0-a852-23a1d023e713',0,'2025-11-25 17:05:52','2025-11-25 17:05:52');
/*!40000 ALTER TABLE `user_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `birthday` date DEFAULT NULL,
  `bio` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('14031bfd-253e-484d-8166-3adca0706a9b','if_you','2394794517@qq.com','$2b$10$RsPPu0yS8tldkPdjKf537OcVn.PL/bMchBm9P1sWY4RHMirhhLeEm',NULL,1,NULL,NULL,NULL,'2025-11-25 17:10:16','2025-11-25 17:10:16'),('363c96f4-dde8-4209-b2b8-bb658a5c2a1c','first_name','2807267929@qq.com','$2b$10$Sk3Fsi3torLrzuX75KQVzOyMxSMxG3G/th4YudAPtoYD/DFyUy8ba',NULL,1,'1997-11-23',NULL,'北京市 西城区','2025-11-25 16:56:52','2025-11-25 16:59:07');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verificationcodes`
--

DROP TABLE IF EXISTS `verificationcodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verificationcodes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_verification_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verificationcodes`
--

LOCK TABLES `verificationcodes` WRITE;
/*!40000 ALTER TABLE `verificationcodes` DISABLE KEYS */;
/*!40000 ALTER TABLE `verificationcodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'blog_system'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26  1:16:17
