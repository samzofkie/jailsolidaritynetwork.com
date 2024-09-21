// https://node-postgres.com/guides/project-structure

const { Pool } = require('pg');

const { formatDate } = require('./utils.js');

const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'jailsolidaritynetwork',
  password: 'xGfKqmOznGVrzHc40WY-Y',
});

async function query(text, params) {
  return pool.query(text, params);
}

async function connect() {
  return pool.connect();
}

async function selectAllTestimonies() {
  const client = await pool.connect();
  
  const { rows: testimonyDivisions } = await client.query(
    'SELECT testimony_divisions.testimony_id, divisions.name ' +
    'FROM testimony_divisions ' +
    'INNER JOIN divisions ON testimony_divisions.division_id = divisions.id'
  );
  const { rows: testimonySentences } = await client.query(
    'SELECT * FROM testimony_sentences'
  );
  const { rows: testimonySentencesCategories } = await client.query(
    'SELECT testimony_sentences_categories.sentence_id, categories.name ' + 
    'FROM testimony_sentences_categories ' +
    'INNER JOIN categories ' +
    'ON testimony_sentences_categories.category_id = categories.id'
  );
  const { rows: testimonyFiles } = await client.query(
    'SELECT testimony_id, file_name FROM testimony_files'
  );

  const testimonies = (await client.query('SELECT * FROM testimonies')).rows
    .map(testimony => ({
      testimonyId: testimony.id,
      dateReceived: formatDate(testimony.date_received),
      lengthOfStay: testimony.length_of_stay,
      gender: testimony.gender,
      divisions: testimonyDivisions
        .filter(td => td.testimony_id === testimony.id)
        .map(td => td.name),
      transcription: testimonySentences
        .filter(ts => ts.testimony_id === testimony.id)
        .map(ts => ({
          sentenceId: ts.id,
          text: ts.sentence,
          categories: testimonySentencesCategories
            .filter(tsc => tsc.sentence_id === ts.id)
            .map(tsc => tsc.name),
        })),
      files: testimonyFiles
        .filter(tf => tf.testimony_id === testimony.id)
        .map(tf => tf.file_name),
    }));

  client.release();
  return testimonies;
}

async function insertTestimony(data) {
  const client = await pool.connect();
  let testimonyId;

  try {
    await client.query('BEGIN');
  
    const testimoniesFields = [
      data.dateReceived,
      data.lengthOfStay,
      data.gender
    ];

    if (testimoniesFields.every(property => property === undefined)) {
      testimonyId = (await client.query(
        'INSERT INTO testimonies DEFAULT VALUES'
      )).rows[0].id;
    } else {
      let insertionCommand = 'INSERT INTO testimonies (';
      let insertionValues = [];

      if (data.dateReceived !== undefined) {
        insertionCommand += 'date_received, ';
        insertionValues.push(data.dateReceived + '-01');
      }

      if (data.lengthOfStay !== undefined) {
        insertionCommand += 'length_of_stay, ';
        insertionValues.push(data.lengthOfStay);
      }

      if (data.gender !== undefined) {
        insertionCommand += 'gender, ';
        insertionValues.push(data.gender);
      }

      insertionCommand = insertionCommand.slice(0, -2) + ') VALUES ('
        + testimoniesFields
          .filter(field => field !== undefined)
          .map((_, i) => '$' + (i + 1))
          .join(', ')
        + ') RETURNING id';

      testimonyId = (await client.query(
        insertionCommand,
        insertionValues
      )).rows[0].id;
    }

    if (data.divisions)
      for (const division of data.divisions)
        await client.query(
          'INSERT INTO testimony_divisions (testimony_id, division_id) ' +
          'VALUES ($1, (SELECT id FROM divisions WHERE name = $2))',
          [testimonyId, division]
        );

    if (data.transcription)
      for (const sentenceObject of data.transcription) {
        const sentenceId = (await client.query(
          `INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id`,
          [sentenceObject.text, testimonyId]
        )).rows[0].id;

        for (const category of sentenceObject.categories)
          await client.query(
            `INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))`,
            [sentenceId, category]
          );
      }
  
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return testimonyId;
}

async function deleteTestimonySentences(client, testimonyId) {
  const existingSentenceIds = (await client.query(
    'SELECT id FROM testimony_sentences WHERE testimony_id = $1',
    [testimonyId]
  )).rows.map(row => row.id);
  
  // Delete all those sentences
  await client.query(
    'DELETE FROM testimony_sentences WHERE testimony_id = $1',
    [testimonyId]
  );

  // Delete each row in testimony_sentences_categories where sentence_id 
  // is in existingSentenceIds
  for (const sentenceId of existingSentenceIds) {
    await client.query(
      'DELETE FROM testimony_sentences_categories WHERE sentence_id = $1',
      [sentenceId]
    );
  }
}

async function updateTestimony(testimonyId, data) {
  if (!(Object.keys(data).length))
    return;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const testimoniesFields = [
      data.dateReceived,
      data.lengthOfStay,
      data.gender
    ];

    if (testimoniesFields.some(property => property !== undefined)) {
      let updateCommand = 'UPDATE testimonies SET ';
      let updateValues = [];
      let i = 1;
      if (data.dateReceived !== undefined) {
        updateCommand += `date_received = $${i}, `;
        updateValues.push(data.dateReceived);
        i++;
      }
      if (data.lengthOfStay !== undefined) {
        updateCommand += `length_of_stay = $${i}, `;
        updateValues.push(data.lengthOfStay);
        i++;
      }
      if (data.gender) {
        updateCommand += `gender = $${i}, `;
        updateValues.push(data.gender);
        i++;
      }
      updateCommand = updateCommand.slice(0, -2) + ` WHERE id = $${i}`;
      updateValues.push(testimonyId);

      await client.query(updateCommand, updateValues);
    }

    if (data.divisions) {
      await client.query(
        'DELETE FROM testimony_divisions WHERE testimony_id = $1',
        [testimonyId]
      );

      for (const division of data.divisions)
        await client.query(
          'INSERT INTO testimony_divisions (testimony_id, division_id) ' +
          'VALUES ($1, (SELECT id FROM divisions WHERE name = $2))',
          [testimonyId, division]
        );
    }

    if (data.transcription) {
      await deleteTestimonySentences(client, testimonyId);
    
      for (const sentenceObject of data.transcription) {
        // Insert new sentence
        const sentenceId = (await client.query(
          'INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ' +
          '($1, $2) RETURNING id',
          [sentenceObject.text, testimonyId]
        )).rows[0].id;

        // Insert a new row for each category
        for (const category of sentenceObject.categories)
          await client.query(
            'INSERT INTO testimony_sentences_categories (sentence_id, ' +
            'category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))',
            [sentenceId, category]
          );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.release();
  }
}

async function deleteTestimony(testimonyId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'DELETE FROM testimonies WHERE id = $1',
      [testimonyId]
    );

    await client.query(
      'DELETE FROM testimony_divisions WHERE testimony_id = $1',
      [testimonyId]
    );

    await deleteTestimonySentences(client, testimonyId);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.release();
  }
}

async function insertTestimonyFile(testimonyId, fileName) {
  pool.query('INSERT INTO testimony_files (testimony_id, file_name) VALUES ' +
    '($1, $2)',
    [testimonyId, fileName]
  )
}

async function deleteTestimonyFile(fileId) {
  await pool.query(
    'DELETE FROM testimony_files WHERE id = $1',
    [fileId]
  );
}

module.exports = {
  pool, // only for testing
  query,
  connect,
  selectAllTestimonies,
  insertTestimony,
  deleteTestimonySentences,
  updateTestimony,
  deleteTestimony,
  insertTestimonyFile,
  deleteTestimonyFile,
};