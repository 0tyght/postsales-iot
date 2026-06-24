USE postsales_iot;

ALTER TABLE device_units
  DROP FOREIGN KEY fk_device_units_site;

ALTER TABLE device_units
  MODIFY site_id INT NULL;

ALTER TABLE device_units
  ADD CONSTRAINT fk_device_units_site
  FOREIGN KEY (site_id) REFERENCES customer_sites(site_id)
  ON DELETE SET NULL ON UPDATE CASCADE;
