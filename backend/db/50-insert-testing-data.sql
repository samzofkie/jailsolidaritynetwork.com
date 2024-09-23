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
  ('Sentence.', 1), ('Sentence.', 1), ('Sentence.', 1), ('Sentence.', 1), ('Sentence.', 1),
  ('Sentence.', 1), ('Sentence.', 1), ('Sentence.', 1), ('Sentence.', 1), ('Sentence.', 1),
  ('Sentence.', 2), 
  ('Sentence.', 3), ('Sentence.', 3), ('Sentence.', 3), ('Sentence.', 3), ('Sentence.', 3), 
  ('Sentence', 3), ('Sentence', 3), ('Sentence', 3), ('Sentence', 3), ('Sentence', 3); -- 21 in total

INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES
  (1, 1), (2, 5), (2, 6), (3, 10), (5, 5), (6, 1), (11, 1), (20, 5);

INSERT INTO testimony_files (testimony_id, file_name) VALUES
  (1, 'EO5v57Kj50dkF1vvxIgfm.jpg'), (2, '4S0DdBB7dwcal98nZ996o.png'), (3, 'IX_d_TAkk8zDSqfgzapqt.pdf');