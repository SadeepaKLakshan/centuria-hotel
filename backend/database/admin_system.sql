CREATE TABLE IF NOT EXISTS api_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME NULL,

    INDEX idx_api_tokens_user_id (user_id),
    INDEX idx_api_tokens_token_hash (token_hash),

    CONSTRAINT fk_api_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_number VARCHAR(40) NOT NULL UNIQUE,

    customer_id INT UNSIGNED NOT NULL,

    order_type ENUM(
        'room',
        'food',
        'spa',
        'tour',
        'transport',
        'service',
        'other'
    ) NOT NULL,

    title VARCHAR(150) NOT NULL,

    description TEXT NULL,

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',

    status ENUM(
        'pending',
        'accepted',
        'declined',
        'processing',
        'confirmed',
        'ready',
        'on_the_way',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',

    payment_status ENUM(
        'unpaid',
        'pending',
        'paid',
        'refunded'
    ) NOT NULL DEFAULT 'unpaid',

    assigned_admin_id INT UNSIGNED NULL,

    customer_note TEXT NULL,

    admin_note TEXT NULL,

    requested_date DATE NULL,

    requested_time TIME NULL,

    accepted_at DATETIME NULL,

    declined_at DATETIME NULL,

    completed_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_type (order_type),
    INDEX idx_orders_created (created_at),

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_orders_admin
        FOREIGN KEY (assigned_admin_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_id INT UNSIGNED NOT NULL,

    item_name VARCHAR(150) NOT NULL,

    item_description TEXT NULL,

    quantity INT UNSIGNED NOT NULL DEFAULT 1,

    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_items_order (order_id),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES customer_orders(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_id INT UNSIGNED NOT NULL,

    old_status VARCHAR(30) NULL,

    new_status VARCHAR(30) NOT NULL,

    changed_by INT UNSIGNED NULL,

    note TEXT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_status_history_order (order_id),
    INDEX idx_status_history_changed_by (changed_by),

    CONSTRAINT fk_status_history_order
        FOREIGN KEY (order_id)
        REFERENCES customer_orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS conversations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    customer_id INT UNSIGNED NOT NULL,

    subject VARCHAR(150) NOT NULL DEFAULT 'Customer Support',

    status ENUM(
        'open',
        'closed'
    ) NOT NULL DEFAULT 'open',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_conversations_customer (customer_id),
    INDEX idx_conversations_status (status),

    CONSTRAINT fk_conversation_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    conversation_id INT UNSIGNED NOT NULL,

    sender_id INT UNSIGNED NOT NULL,

    sender_role ENUM(
        'customer',
        'staff',
        'manager',
        'admin'
    ) NOT NULL,

    message TEXT NOT NULL,

    is_read TINYINT(1) NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_read (is_read),

    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NULL,

    type VARCHAR(50) NOT NULL,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    reference_type VARCHAR(50) NULL,

    reference_id INT UNSIGNED NULL,

    is_read TINYINT(1) NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read),

    CONSTRAINT fk_admin_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);