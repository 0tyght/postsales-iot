USE postsales_iot;

ALTER TABLE device_units
  ADD COLUMN purchase_date DATE NULL AFTER device_status,
  ADD COLUMN warranty_years INT NULL AFTER purchase_date;

UPDATE device_units
SET
  purchase_date = COALESCE(purchase_date, DATE(created_at)),
  warranty_years = COALESCE(
    warranty_years,
    CASE
      WHEN warranty_end_date IS NULL THEN NULL
      ELSE GREATEST(1, TIMESTAMPDIFF(YEAR, DATE(created_at), DATE_ADD(warranty_end_date, INTERVAL 1 DAY)))
    END
  )
WHERE purchase_date IS NULL OR warranty_years IS NULL;

UPDATE device_units
SET warranty_end_date = CASE
  WHEN purchase_date IS NOT NULL AND warranty_years IS NOT NULL
  THEN DATE_SUB(DATE_ADD(purchase_date, INTERVAL warranty_years YEAR), INTERVAL 1 DAY)
  ELSE NULL
END;
