DBMS used = MySQL.
database name = ecom

#Tables

CREATE TABLE `users` (
	`id_user` INT NOT NULL AUTO_INCREMENT,
	`email` VARCHAR(100) NOT NULL DEFAULT '0' COLLATE 'utf8mb4_0900_ai_ci',
	`password` VARCHAR(255) NOT NULL DEFAULT '0' COLLATE 'utf8mb4_0900_ai_ci',
	`name` VARCHAR(100) NULL DEFAULT '0' COLLATE 'utf8mb4_0900_ai_ci',
	`created_at` TIMESTAMP NOT NULL DEFAULT (now()),
	PRIMARY KEY (`id_user`) USING BTREE,
	UNIQUE INDEX `email` (`email`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
;


CREATE TABLE `products` (
	`id_product` INT NOT NULL AUTO_INCREMENT,
	`product_name` VARCHAR(50) NOT NULL DEFAULT '0' COLLATE 'utf8mb4_0900_ai_ci',
	`price` DECIMAL(10,2) NOT NULL DEFAULT '0',
	`stock` INT NOT NULL DEFAULT '0',
	`description` TEXT NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	PRIMARY KEY (`id_product`) USING BTREE,
	UNIQUE INDEX `product_name` (`product_name`) USING BTREE,
    
)
COLLATE='utf8mb4_0900_ai_ci'
;

CREATE TABLE `purchases` (
	`id_purchase` INT NOT NULL AUTO_INCREMENT,
	`user_id` INT NULL DEFAULT '0',
	`product_id` INT NULL DEFAULT '0',
	`quantity` INT NULL DEFAULT '0',
	`total_price` DECIMAL(10,2) NULL DEFAULT NULL,
	`status` ENUM('pending','processing','shipped','delivered','cancelled') NULL DEFAULT 'pending' COLLATE 'utf8mb4_0900_ai_ci',
	PRIMARY KEY (`id_purchase`) USING BTREE
    FOREIGN KEY (`user_id`) REFERENCES users(`id_user`),
    FOREIGN KEY (`product_id`) REFERENCES products(`id_product`)
)
COLLATE='utf8mb4_0900_ai_ci'
;
