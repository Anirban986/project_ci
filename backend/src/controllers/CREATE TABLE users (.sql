CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    username VARCHAR(255) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    role VARCHAR(20)
    CHECK (
        role IN (
            'patient',
            'doctor',
            'pharmacy',
            'admin'
        )
    )
    DEFAULT 'patient',

    phone_number VARCHAR(20),

    plan VARCHAR(20)
        CHECK (plan IN ('free', 'premium'))
        DEFAULT 'free',

    mfa_enabled BOOLEAN DEFAULT FALSE,

    mfa_secret TEXT,

    password TEXT NOT NULL,

    reset_password_otp VARCHAR(255),

    reset_password_otp_expires TIMESTAMP,

    reset_password_attempts INTEGER DEFAULT 0,

    is_verified BOOLEAN DEFAULT FALSE,

    verification_code VARCHAR(255),

    verification_code_expires TIMESTAMP,

    reset_password_token TEXT,

    reset_password_expires TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);