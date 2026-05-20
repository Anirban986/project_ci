CREATE TABLE patient_profiles (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth   DATE,
  gender          VARCHAR(10),
  blood_group     VARCHAR(5),
  allergies       TEXT[],
  emergency_contact_name  VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);