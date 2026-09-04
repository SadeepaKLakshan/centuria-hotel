CREATE DATABASE IF NOT EXISTS centuria_hotel
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE centuria_hotel;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(190) NULL UNIQUE,

    phone VARCHAR(40) NULL UNIQUE,

    country_code VARCHAR(10) NULL,

    country VARCHAR(100) NULL,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'customer',
        'staff',
        'manager',
        'admin'
    ) NOT NULL DEFAULT 'customer',

    is_verified TINYINT(1) NOT NULL DEFAULT 0,

    account_status ENUM(
        'active',
        'inactive',
        'blocked'
    ) NOT NULL DEFAULT 'active',

    profile_image VARCHAR(255) NULL,

    email_verified_at DATETIME NULL,

    phone_verified_at DATETIME NULL,

    last_login_at DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_otps (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    identifier VARCHAR(190) NOT NULL,

    channel ENUM(
        'email',
        'phone'
    ) NOT NULL,

    otp_hash VARCHAR(255) NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(190) NULL,

    phone VARCHAR(40) NULL,

    country_code VARCHAR(10) NULL,

    country VARCHAR(100) NULL,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'customer',
        'staff',
        'manager',
        'admin'
    ) NOT NULL DEFAULT 'customer',

    expires_at DATETIME NOT NULL,

    attempts INT UNSIGNED NOT NULL DEFAULT 0,

    is_verified TINYINT(1) NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_registration_identifier (
        identifier
    ),

    INDEX idx_registration_expires (
        expires_at
    )
);

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    identifier VARCHAR(190) NOT NULL,

    channel ENUM(
        'email',
        'phone'
    ) NOT NULL,

    otp_hash VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    attempts INT UNSIGNED NOT NULL DEFAULT 0,

    is_verified TINYINT(1) NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_reset_identifier (
        identifier
    ),

    INDEX idx_reset_expires (
        expires_at
    )
);

CREATE TABLE IF NOT EXISTS login_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NULL,

    identifier VARCHAR(190) NULL,

    ip_address VARCHAR(45) NULL,

    user_agent TEXT NULL,

    status ENUM(
        'success',
        'failed'
    ) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_login_log_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS otp_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    identifier VARCHAR(190) NOT NULL,

    channel ENUM(
        'email',
        'phone'
    ) NOT NULL,

    purpose ENUM(
        'register',
        'password_reset'
    ) NOT NULL,

    status ENUM(
        'sent',
        'failed',
        'verified',
        'expired'
    ) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);