CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  shorthand VARCHAR(3) UNIQUE
);
INSERT INTO categories (name, shorthand) VALUES
  ('Basic Services and Materials', 'BSM'),
  ('Contact and Family', 'CF'),
  ('Jail Rules and Grievances', 'JRG'),
  ('Education and Programming', 'EP'),
  ('Facilities', 'F'),
  ('Food and Water', 'FW'),
  ('Legal System', 'LS'),
  ('Mental and Physical Health and Care', 'MPH'),
  ('Staff Treatment', 'ST'),
  ('Violence', 'V'),
  ('Administration, Corruption, and Budget', 'ACB');