-- Additive migration: existing models are explicitly unclassified, never guessed from model codes.
ALTER TABLE device_models
  ADD COLUMN IF NOT EXISTS device_type VARCHAR(80) NOT NULL DEFAULT 'ยังไม่ระบุประเภท';
