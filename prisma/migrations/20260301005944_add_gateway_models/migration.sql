-- CreateTable
CREATE TABLE `sources` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `base_url` VARCHAR(500) NOT NULL,
    `api_key` VARCHAR(500) NOT NULL,
    `models` JSON NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `weight` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `model_configs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `model_id` VARCHAR(100) NOT NULL,
    `display_name` VARCHAR(100) NOT NULL,
    `input_price` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `output_price` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `rpm` INTEGER NOT NULL DEFAULT 60,
    `tpm` INTEGER NOT NULL DEFAULT 100000,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `model_configs_model_id_key`(`model_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_keys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `allowed_models` JSON NOT NULL,
    `total_quota` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `used_quota` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `daily_quota` DECIMAL(12, 6) NULL,
    `daily_used` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `daily_reset_at` DATETIME(3) NULL,
    `monthly_quota` DECIMAL(12, 6) NULL,
    `monthly_used` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `monthly_reset_at` DATETIME(3) NULL,
    `rpm` INTEGER NOT NULL DEFAULT 60,
    `tpm` INTEGER NOT NULL DEFAULT 100000,
    `expired_at` DATETIME(3) NULL,
    `last_used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `api_keys_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `api_key_id` INTEGER NOT NULL,
    `key_name` VARCHAR(100) NOT NULL,
    `model_id` VARCHAR(100) NOT NULL,
    `source_id` INTEGER NULL,
    `prompt_tokens` INTEGER NOT NULL DEFAULT 0,
    `completion_tokens` INTEGER NOT NULL DEFAULT 0,
    `total_tokens` INTEGER NOT NULL DEFAULT 0,
    `cost` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `latency_ms` INTEGER NOT NULL DEFAULT 0,
    `status_code` INTEGER NOT NULL DEFAULT 200,
    `is_stream` BOOLEAN NOT NULL DEFAULT false,
    `error_msg` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_api_key`(`api_key_id`),
    INDEX `idx_model`(`model_id`),
    INDEX `idx_created`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `request_logs` ADD CONSTRAINT `request_logs_api_key_id_fkey` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_logs` ADD CONSTRAINT `request_logs_source_id_fkey` FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
