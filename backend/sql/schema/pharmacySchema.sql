CREATE TABLE pharmacy_profiles (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacy_name     VARCHAR(255),
  license_number    VARCHAR(100) UNIQUE,
  address           TEXT,
  operating_hours   JSONB,         -- { mon: "9am-9pm", tue: "9am-9pm" }
  delivery_available BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);