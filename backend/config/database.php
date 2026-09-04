<?php

declare(strict_types=1);

function getDatabaseConnection(): PDO
{
    $host = '127.0.0.1';
    $port = '3306';
    $database = 'centuria_hotel';
    $username = 'root';
    $password = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset={$charset}";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        return new PDO(
            $dsn,
            $username,
            $password,
            $options
        );
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());

        throw new RuntimeException(
            'Unable to connect to the database.'
        );
    }
}