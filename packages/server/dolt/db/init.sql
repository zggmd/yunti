-- 初始化数据库
DROP DATABASE IF EXISTS yunti;
CREATE DATABASE yunti;
USE yunti;

-- 初始化表
CREATE TABLE `apps_members` (
  `app_id` varchar(16) NOT NULL,
  `user_id` varchar(16) NOT NULL,
  `role` enum (
    'Guest',
    'Reporter',
    'Developer',
    'Maintainer',
    'Owner'
  ) NOT NULL DEFAULT 'Guest',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`app_id`, `user_id`)
) ENGINE = InnoDB;
CREATE TABLE `pages` (
  `id` varchar(16) NOT NULL,
  `title` varchar(255) NOT NULL,
  `pathname` varchar(255) NOT NULL,
  `packages` json NULL,
  `content` json NULL,
  `app_id` varchar(16) NOT NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `version` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
CREATE TABLE `publish_records` (
  `id` varchar(16) NOT NULL,
  `build_id` varchar(255) NOT NULL,
  `app_id` varchar(16) NOT NULL,
  `channel_id` varchar(16) NULL,
  `channel_name` varchar(16) NOT NULL,
  `name` varchar(255) NOT NULL,
  `baseline` varchar(255) NOT NULL,
  `tree` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `status` enum ('Running', 'Done', 'Failed') NOT NULL DEFAULT 'Running',
  `detail` json NULL,
  `publisher_id` varchar(16) NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `channel-name-idx` (`channel_name`),
  INDEX `name-idx` (`name`),
  INDEX `baseline-idx` (`baseline`),
  INDEX `version-idx` (`version`),
  INDEX `status-idx` (`status`),
  UNIQUE INDEX `IDX_f2902ffb05b59dbf53e4968a8d` (`build_id`),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
CREATE TABLE `publish_channels` (
  `id` varchar(16) NOT NULL,
  `name` varchar(255) NOT NULL,
  `app_id` varchar(16) NULL,
  `type` enum ('Helm', 'Github', 'Gitlab') NOT NULL DEFAULT 'Helm',
  `built_in` tinyint NOT NULL DEFAULT 0,
  `status` enum ('Healthy', 'Abnormal') NOT NULL DEFAULT 'Healthy',
  `detail` json NULL,
  `updator_id` varchar(16) NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `name-idx` (`name`),
  INDEX `type-idx` (`type`),
  INDEX `built-in-idx` (`built_in`),
  INDEX `status-idx` (`status`),
  UNIQUE INDEX `UQ_APPID_NAME` (`app_id`, `name`),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
CREATE TABLE `apps` (
  `id` varchar(16) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NULL,
  `assets` json NULL,
  `schema` json NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE INDEX `IDX_c1a24df1d51c2748d97561b77d` (`name`),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
CREATE TABLE `blocks` (
  `id` varchar(16) NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `packages` json NULL,
  `schema` json NOT NULL,
  `screenshot` text NOT NULL,
  `creator_id` varchar(16) NOT NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `version` int NOT NULL,
  UNIQUE INDEX `IDX_cf76c8e0cef079c9441a579246` (`name`),
  UNIQUE INDEX `IDX_71e9c749a467affe322d707d2b` (`title`),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
CREATE TABLE `components_members` (
  `component_id` varchar(16) NOT NULL,
  `user_id` varchar(16) NOT NULL,
  `role` enum (
    'Guest',
    'Reporter',
    'Developer',
    'Maintainer',
    'Owner'
  ) NOT NULL DEFAULT 'Guest',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`component_id`, `user_id`)
) ENGINE = InnoDB;
CREATE TABLE `components_versions` (
  `component_id` varchar(16) NOT NULL,
  `version` varchar(255) NOT NULL,
  `commit_id` varchar(255) NOT NULL,
  `description` varchar(255) NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`component_id`, `version`)
) ENGINE = InnoDB;
CREATE TABLE `components` (
  `id` varchar(16) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NULL,
  `assets` json NULL,
  `schema` json NULL,
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE INDEX `IDX_673dc1c412adfb5b54ec419224` (`name`),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
CREATE TABLE `users` (
  `id` varchar(16) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum ('SystemAdmin', 'User') NOT NULL DEFAULT 'User',
  `create_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE INDEX `IDX_51b8b26ac168fbe7d6f5653e6c` (`name`),
  UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`),
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;
ALTER TABLE `apps_members`
ADD CONSTRAINT `FK_c16151b3e52da52fbd2cb86bc90` FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `apps_members`
ADD CONSTRAINT `FK_4f095cb961fbab7836580f49a68` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `pages`
ADD CONSTRAINT `FK_7dd9eb69eb2a89d8c2f04541f6f` FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `publish_records`
ADD CONSTRAINT `FK_59e8e16d617a1453c5c4512e4bb` FOREIGN KEY (`channel_id`) REFERENCES `publish_channels`(`id`) ON DELETE
SET NULL ON UPDATE NO ACTION;
ALTER TABLE `publish_records`
ADD CONSTRAINT `FK_101d0911f18830a440ec29224e6` FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `publish_records`
ADD CONSTRAINT `FK_d4482b7e5335058a5620699f9cd` FOREIGN KEY (`publisher_id`) REFERENCES `users`(`id`) ON DELETE
SET NULL ON UPDATE NO ACTION;
ALTER TABLE `publish_channels`
ADD CONSTRAINT `FK_96a478badffd6e9a86c849886d9` FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `publish_channels`
ADD CONSTRAINT `FK_9535af5c49627e6256fc52e4fa0` FOREIGN KEY (`updator_id`) REFERENCES `users`(`id`) ON DELETE
SET NULL ON UPDATE NO ACTION;
ALTER TABLE `blocks`
ADD CONSTRAINT `FK_d380c5db25c18bdc0722c8468db` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `components_members`
ADD CONSTRAINT `FK_03a0ebbb8e4465b1a6af9a0a3be` FOREIGN KEY (`component_id`) REFERENCES `components`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `components_members`
ADD CONSTRAINT `FK_50a7a61d242a56932fbc018b46e` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `components_versions`
ADD CONSTRAINT `FK_ad5dadfb989e87de28bba6b7c39` FOREIGN KEY (`component_id`) REFERENCES `components`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

INSERT INTO dolt_ignore (pattern, ignored) values ('merge_requests', true), ('publish_channels', true), ('publish_records', true);

CREATE TABLE `merge_requests` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'mr 主键，自增',
  `author_id` varchar(16) NOT NULL COMMENT '创建人用户id',
  `assignee_id` varchar(16) COMMENT '经办人用户id',
  `source_branch` varchar(100) NOT NULL COMMENT '合并源分支',
  `target_branch` varchar(100) COMMENT '合并目标分支',
  `title` varchar(200) NOT NULL COMMENT '标题，非空',
  `description` text COMMENT '描述',
  `options` json COMMENT '合并请求选项，delSourBranch: 0 为 不删除源分支，1为删除源分支，默认为不删除',
  `updater_id` varchar(16) COMMENT '修改合并请求本身的用户 id，可以是创建人，也可以是项目管理',
  `merge_status` enum('Openning','Merged','Closed','Draft','Conflicted') NOT NULL DEFAULT 'Openning' COMMENT 'Openning: 等待合并,Merged：已合并，Closed：已关闭，Draft：draft , Conflicted: 有冲突',
  `source_type` enum('app','component') COMMENT 'app：app 代码合并请求, component: component 代码合并请求',
  `source_object_id` varchar(16) NOT NULL COMMENT 'app id, 或者 components id',
  `merge_error` text COMMENT '合并错误信息',
  `merge_user_id` varchar(16) COMMENT '合并人 id',
  `merge_commit_sha` varchar(16) COMMENT '合并后 commit id',
  `create_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)) COMMENT 'merge request 创建时间',
  `update_at` datetime(6) COMMENT 'merge request 修改时间',
  `target_commit_sha` varchar(16) COMMENT '目标合并时commit id',
  `conflict_diff_data` longblob COMMENT '冲突数据对比',
  `conflict_diff_schema` longblob COMMENT '冲突shema对比',
  PRIMARY KEY (`id`),
  KEY `merge_requests_assignee_id_IDX` (`assignee_id`),
  KEY `merge_requests_author_id_IDX` (`author_id`),
  KEY `merge_requests_source_object_id_IDX` (`source_object_id`),
  KEY `merge_user_id` (`merge_user_id`),
  KEY `updater_id` (`updater_id`),
  CONSTRAINT `merge_requests_FK` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `merge_requests_FK_1` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `merge_requests_FK_2` FOREIGN KEY (`merge_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `merge_requests_FK_3` FOREIGN KEY (`updater_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;
-- ALTER TABLE yunti.merge_requests ADD `options` json COMMENT '合并请求选项，delSourBranch: 0 为 不删除源分支，1为删除源分支，默认为不删除';

-- 初始化 dolt schema
CALL DOLT_ADD(
  'users',
  'apps',
  'apps_members',
  'pages',
  'blocks',
  'components',
  'components_members',
  'components_versions'
);
CALL DOLT_COMMIT(
  '-m',
  'Created initial schema',
  '--author',
  'yunti-server <yunti@yuntijs.com>'
);
