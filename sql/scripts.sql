
-- -----------------------------------------------------
-- SCHEMA `db_tyba`
-- -----------------------------------------------------

CREATE SCHEMA `db_tyba` DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish_ci ;

-- -----------------------------------------------------
-- Table `db_tyba`.`users`
-- -----------------------------------------------------
CREATE TABLE `db_tyba`.`users` (
  `id` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_spanish_ci;

-- -----------------------------------------------------
-- Table `db_tyba`.`transactions`
-- -----------------------------------------------------
CREATE TABLE `db_tyba`.`transactions` (
  `id` VARCHAR(45) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `user_id` VARCHAR(100) CHARACTER SET 'utf8' COLLATE 'utf8_spanish_ci' NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `value` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`user_id`),
  INDEX `fk_transaction_has_users_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_transaction_has_users_idx`
    FOREIGN KEY (`user_id`)
    REFERENCES `db_tyba`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_spanish_ci;SELECT * FROM db_tyba.users;