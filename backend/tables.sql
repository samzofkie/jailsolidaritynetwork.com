CREATE DATABASE jailsolidaritynetwork;
USE jailsolidaritynetwork;
CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT, 
  name VARCHAR(255), 
  PRIMARY KEY (id)
);
INSERT INTO categories (name) VALUES
  ('Basic Services and Materials'),
  ('Contact and Family'),
  ('Jail Rules and Grievances'),
  ('Education and Programming'),
  ('Facilities'),
  ('Food and Water'),
  ('Legal System'),
  ('Mental and Physical Health and Care'),
  ('Staff Treatment'),
  ('Violence'),
  ('Administration, Corruption, and Budget');