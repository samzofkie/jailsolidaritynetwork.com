// https://node-postgres.com/guides/project-structure

const { Pool } = require('pg');

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
          'INSERT INTO testimony_divisions (testimony_id, division_id) \
          VALUES ($1, (SELECT id FROM divisions WHERE name = $2))',
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

async function updateTestimony(testimonyId, data) {
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
      updateCommand = updateCommand.slice(0, -2) + ` WHERE testimony_id = $${i}`;
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
          'INSERT INTO testimony_divisions (testimony_id, division_id) \
          VALUES ($1, (SELECT id FROM divisions WHERE name = $2))',
          [testimonyId, division]
        );
    }

    if (data.transcription) {
      
      // Delete existing sentences and testimony_sentences_categories

      const existingSentenceIds = (await client.query(
        'SELECT id FROM testimony_sentences WHERE testimony_id = $1',
        [testimonyId]
      )).rows;
      console.log(existingSentenceIds);

      await client.query(
        'DELETE FROM testimony_sentences WHERE testimony_id = $1',
        [testimonyId]
      );

      // Insert new testimony_sentences

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
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.release();
  }
}

module.exports = {
  query,
  connect,
  insertTestimony,
  updateTestimony,
};