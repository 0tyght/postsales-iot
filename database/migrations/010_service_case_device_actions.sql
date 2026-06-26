USE postsales_iot;

ALTER TABLE problem_devices
  DROP CONSTRAINT chk_replacement_device;

ALTER TABLE problem_devices
  MODIFY repair_method ENUM('repair','replace','add','remove') NOT NULL;

ALTER TABLE problem_devices
  ADD CONSTRAINT chk_replacement_device CHECK (
    (repair_method = 'replace' AND replacement_device_id IS NOT NULL)
    OR repair_method IN ('repair','add','remove')
  );
