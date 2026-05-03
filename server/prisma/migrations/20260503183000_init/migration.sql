CREATE TABLE IF NOT EXISTS `role` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `rolename` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `user` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(50) NOT NULL,
    `lastname` VARCHAR(50) NOT NULL,
    `birthday` DATE NOT NULL,
    `avatar` VARCHAR(255),
    `email` VARCHAR(50) NOT NULL,
    `hashed_password` VARCHAR(255) NOT NULL,
    `role_id` INT DEFAULT 2,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_email_key` (`email`),
    CONSTRAINT `fk_user_role`
      FOREIGN KEY (`role_id`)
      REFERENCES `role` (`id`)
      ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `request` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `title` VARCHAR(50) NOT NULL,
    `tag1` VARCHAR(50) NOT NULL,
    `tag2` VARCHAR(50),
    `details1` TEXT NOT NULL,
    `details2` TEXT,
    `details3` TEXT,
    `user_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_request_user`
      FOREIGN KEY (`user_id`)
      REFERENCES `user` (`id`)
      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `comment` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `details` TEXT NOT NULL,
    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `user_id` INT NOT NULL DEFAULT 1,
    `request_id` INT NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_comment_user`
      FOREIGN KEY (`user_id`)
      REFERENCES `user` (`id`)
      ON DELETE CASCADE,
    CONSTRAINT `fk_comment_request`
      FOREIGN KEY (`request_id`)
      REFERENCES `request` (`id`)
      ON DELETE CASCADE
);

INSERT IGNORE INTO `role` (`id`, `rolename`) VALUES
  (1, 'admin'),
  (2, 'visitor');
