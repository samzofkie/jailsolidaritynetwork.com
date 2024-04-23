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

CREATE TABLE divisions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(15) UNIQUE
);

INSERT INTO divisions (name) VALUES
  ('2'), ('3'), ('4'), ('6'), ('9'), ('10'), ('11'), ('14'), ('Cermak'), ('Solitary');

CREATE TABLE genders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(15) UNIQUE
);

INSERT INTO genders (name) VALUES
  ('Male'), ('Female'), ('Non-binary'), ('Other');

CREATE TABLE testimonies (
  id SERIAL PRIMARY KEY,
  date_received DATE,
  length_of_stay INT,
  gender VARCHAR(15)
);

CREATE TABLE testimony_divisions (
  id SERIAL PRIMARY KEY,
  testimony_id INT NOT NULL REFERENCES testimonies(id),
  division_id INT NOT NULL REFERENCES divisions(id)
);

CREATE TABLE testimony_sentences (
  id SERIAL PRIMARY KEY,
  sentence TEXT,
  testimony_id INT NOT NULL REFERENCES testimonies(id)
);

CREATE TABLE testimony_sentences_categories (
  id SERIAL PRIMARY KEY,
  sentence_id INT NOT NULL REFERENCES testimony_sentences(id),
  category_id INT NOT NULL REFERENCES categories(id)
);

CREATE TABLE testimony_files (
  id SERIAL PRIMARY KEY,
  testimony_id INT NOT NULL REFERENCES testimonies(id),
  file_name TEXT
)