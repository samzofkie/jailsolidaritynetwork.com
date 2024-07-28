CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  salt VARCHAR(40),
  hash VARCHAR(128)
);

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
);

-- Test values
INSERT INTO testimonies (date_received, length_of_stay, gender) VALUES
  ('2024-01-01', 12, 'Male'), -- 1
  ('2024-02-02', 1, 'Male'), -- 2
  ('2023-11-01', 30, 'Female'), -- 3
  ('2023-12-01', 10, 'Male'); -- 4

INSERT INTO testimony_divisions (testimony_id, division_id) VALUES
  (1, 3), (1, 4), (1, 6),
  (2, 1),
  (3, 2), (3, 3), (3, 4), (3, 5), (3, 8), (3, 9);

INSERT INTO testimony_sentences (sentence, testimony_id) VALUES
  ('Sentence', 1), ('Sentence', 1), ('Sentence', 1), ('Sentence', 1), ('Sentence', 1),
  ('Sentence', 1), ('Sentence', 1), ('Sentence', 1), ('Sentence', 1), ('Sentence', 1),
  ('Sentence', 2), 
  ('Sentence', 3), ('Sentence', 3), ('Sentence', 3), ('Sentence', 3), ('Sentence', 3), 
  ('Sentence', 3), ('Sentence', 3), ('Sentence', 3), ('Sentence', 3), ('Sentence', 3); -- 21 in total

INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES
  (1, 1), (2, 5), (2, 6), (3, 10), (5, 5), (6, 1), (11, 1), (20, 5);

INSERT INTO testimony_files (testimony_id, file_name) VALUES
  (1, '1-0.pdf'), (1, '1-1.pdf'), (2, '2-0.jpg'), (4, '4-0.jpg'), (4, '4-1.jpg'), (4, '4-2.pdf');