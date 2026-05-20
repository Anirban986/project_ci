CREATE TABLE doctor_profiles (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization      VARCHAR(255),
  license_number      VARCHAR(100) UNIQUE,
  years_of_experience INTEGER,
  clinic_name         VARCHAR(255),
  clinic_address      TEXT,
  available_days      TEXT[],       -- ['monday', 'wednesday', 'friday']
  consultation_fee    DECIMAL(10,2),
  bio                 TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);