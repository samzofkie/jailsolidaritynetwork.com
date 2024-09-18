const pg = require('pg');
const {
  pool,
  query,
  connect,
  selectAllTestimonies,
  insertTestimony,
  updateTestimony,
} = require('../src/db.js');

jest.mock('pg');

beforeEach(() => {
  pool.connect.mockClear();
});

describe('query', () => {
  test('query calls pool', async () => {
    await query('query', ['param']);
  
    const call = pool.query.mock.calls[0];
    expect(call[0]).toBe('query');
    expect(call[1][0]).toBe('param');
  });
});

describe('connect', () => {
  test('connect calls pool', async () => {
    await connect();
    expect(pool.connect.mock.calls).toHaveLength(1);
  });
});

describe('selectAllTestimonies', () => {
  let client;

  beforeEach(() => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce({
          rows: [
            {testimony_id: 1, name: 'A'},
            {testimony_id: 1, name: 'B'},
            {testimony_id: 2, name: 'B'},
          ]
        }).mockReturnValueOnce({
          rows: [
            {id: 1, testimony_id: 1, sentence: 'A sentence.'},
            {id: 2, testimony_id: 1, sentence: 'Another sentence.'},
            {id: 3, testimony_id: 2, sentence: 'Yet another.'},
          ]
        }).mockReturnValueOnce({
          rows: [
            {sentence_id: 1, name: 'A'},
            {sentence_id: 1, name: 'B'},
            {sentence_id: 3, name: 'C'},
          ]
        }).mockReturnValueOnce({
          rows: [
            {testimony_id: 1, file_name: '1.pdf'},
            {testimony_id: 1, file_name: '2.pdf'},
          ]
        }).mockReturnValueOnce({
          rows: [
            {id: 1, date_received: '2024-01-01T00:00:00.000Z', length_of_stay: 4, gender: 'Male'},
            {id: 2, date_received: '2024-02-01T00:00:00.000Z', length_of_stay: 10, gender: 'Female'},
          ]
        }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);
  });

  test('calls connect', async () => {
    await selectAllTestimonies();
    expect(pool.connect.mock.calls).toHaveLength(1);
  });

  test('releases client', async () => {
    await selectAllTestimonies();
    expect(client.release.mock.calls).toHaveLength(1);
  });

  test('queries client 5 times', async () => {
    await selectAllTestimonies();
    expect(client.query.mock.calls).toHaveLength(5);
  });

  test('formats testimonyId properly', async () => {
    const testimonies = await selectAllTestimonies();
    expect(testimonies.map(t => t.testimonyId)).toContain(1);
    expect(testimonies.map(t => t.testimonyId)).toContain(2);
  });

  test('formats dateReceived properly', async () => {
    const testimonies = await selectAllTestimonies();
    expect(testimonies.map(t => t.dateReceived)).toContain('2024-01');
    expect(testimonies.map(t => t.dateReceived)).toContain('2024-02');
  });

  test('formats lengthOfStay properly', async () => {
    const testimonies = (await selectAllTestimonies())
      .map(t => t.lengthOfStay);
    expect(testimonies).toContain(4);
    expect(testimonies).toContain(10);
  });
  
  test('formats gender properly', async () => {
    const genders = (await selectAllTestimonies())
      .map(t => t.gender);
    expect(genders).toContain('Male');
    expect(genders).toContain('Female');
  });

  test('formats divisions properly', async () => {
    const divisions = (await selectAllTestimonies())
      .map(t => t.divisions);
    expect(divisions[0]).toContain('A');
    expect(divisions[0]).toContain('B');
    expect(divisions[1]).toContain('B');
  });

  test('formats transcriptions properly', async () => {
    const transcriptions = (await selectAllTestimonies())
      .map(t => t.transcription);

    expect(transcriptions[0][0].sentenceId).toBe(1);
    expect(transcriptions[0][0].text).toBeDefined();
    expect(transcriptions[0][0].categories).toContain('A');
    expect(transcriptions[0][0].categories).toContain('B');

    expect(transcriptions[0][1].sentenceId).toBe(2);
    expect(transcriptions[0][1].text).toBeDefined();
    expect(transcriptions[0][1].categories).toHaveLength(0);

    expect(transcriptions[1][0].sentenceId).toBe(3);
    expect(transcriptions[1][0].text).toBeDefined();
    expect(transcriptions[1][0].categories).toHaveLength(1);
  });

  test('formats files properly', async () => {
    const files = (await selectAllTestimonies())
      .map(t => t.files);
    expect(files[0]).toContain('1.pdf');
    expect(files[0]).toContain('2.pdf');
    expect(files[1]).toHaveLength(0);
  });

});

describe('insertTestimony', () => {
  let client;

  describe('no divisions or transcriptions queries', () => {
    beforeEach(async () => {
      client = {
        query: jest.fn()
          .mockReturnValueOnce(null)
          .mockReturnValueOnce({rows: [{id: 1}]})
          .mockReturnValueOnce(null),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(client);
    });
    
    describe('empty data', () => {
      beforeEach(async () => {
        await insertTestimony({});
      });
    
      test('calls connect', async () => {
        expect(pool.connect.mock.calls).toHaveLength(1);
      });
  
      test('releases client', async () => {
        expect(client.release.mock.calls).toHaveLength(1);
      });
    
      test('uses postgres transaction', async () => {
        const queries = client.query.mock.calls.map(params => params[0]);
        expect(queries).toContain('BEGIN');
        expect(queries).toContain('COMMIT');
      });
    });
  
    // TODO test('calls rollback in case of exception', async () => {
  
    describe('builds insertion query correctly', () => {
      test('no values', async () => {
        await insertTestimony({});
        expect(client.query.mock.calls[1][0]).toBe('INSERT INTO testimonies DEFAULT VALUES');
      });
  
      test('dateReceived only', async () => {
        await insertTestimony({dateReceived: '2024-01'});
        const insertionArgs = client.query.mock.calls[1];
        expect(insertionArgs[0]).toBe('INSERT INTO testimonies (date_received) VALUES ($1) RETURNING id');
        expect(insertionArgs[1][0]).toBe('2024-01-01');
      });
  
      test('dateReceived and gender', async () => {
        await insertTestimony({dateReceived: '2024-02', gender: 'Male'});
        const insertionArgs = client.query.mock.calls[1];
        expect(insertionArgs[0]).toBe('INSERT INTO testimonies (date_received, gender) VALUES ($1, $2) RETURNING id');
        expect(insertionArgs[1][0]).toBe('2024-02-01');
        expect(insertionArgs[1][1]).toBe('Male');
      });
  
      test('all three', async () => {
        await insertTestimony({dateReceived: '2024-02', lengthOfStay: 5, gender: 'Male'});
        const insertionArgs = client.query.mock.calls[1];
        expect(insertionArgs[0]).toBe('INSERT INTO testimonies (date_received, length_of_stay, gender) VALUES ($1, $2, $3) RETURNING id');
        expect(insertionArgs[1][0]).toBe('2024-02-01');
        expect(insertionArgs[1][1]).toBe(5);
        expect(insertionArgs[1][2]).toBe('Male');
      });
    });
  });

  test('inserts divisions correctly', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null) // BEGIN
        .mockReturnValueOnce({rows: [{id: 1}]})
        .mockReturnValueOnce(null) // '1'
        .mockReturnValueOnce(null) // '2'
        .mockReturnValueOnce(null) // '3'
        .mockReturnValueOnce(null), // COMMIT
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await insertTestimony({divisions: ['1', '2', '3']});

    const [query, args] = client.query.mock.calls[2];
    expect(query).toBe('INSERT INTO testimony_divisions (testimony_id, division_id) VALUES ($1, (SELECT id FROM divisions WHERE name = $2))');
    expect(args[0]).toBe(1);
    expect(args[1]).toBe('1');
  });

  test('inserts transcription correctly', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null) // BEGIN
        .mockReturnValueOnce({rows: [{id: 1}]})
        .mockReturnValueOnce({rows: [{id: 1}]}) 
        .mockReturnValueOnce(null) // 'A'
        .mockReturnValueOnce(null) // 'B'
        .mockReturnValueOnce({rows: [{id: 2}]}) 
        .mockReturnValueOnce(null), // COMMIT
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await insertTestimony({transcription: [
      {text: 'First sentence.', categories: ['A', 'B']},
      {text: 'Another sentence.', categories: []},
    ]});

    const calls = client.query.mock.calls;

    expect(calls[2][0]).toBe('INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id');
    expect(calls[5][0]).toBe('INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id');
    expect(calls[2][1][0]).toBe('First sentence.');
    expect(calls[2][1][1]).toBe(1);

    expect(calls[3][0]).toBe('INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))');
    expect(calls[4][0]).toBe('INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))');

    expect(calls[3][1][0]).toBe(1);
    expect(calls[3][1][1]).toBe('A');
    expect(calls[4][1][0]).toBe(1);
    expect(calls[4][1][1]).toBe('B');

  });
});

describe('updateTestimony', () => {
  let client;

  test('empty object', async ()=> {
    client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(1, {});

    expect(pool.connect.mock.calls).toHaveLength(0);
    expect(client.query.mock.calls).toHaveLength(0);
    expect(client.release.mock.calls).toHaveLength(0);
  });

  test('calls connect', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(1, {dateReceieved: '2024-01'});

    expect(pool.connect.mock.calls).toHaveLength(1);
  });

  test('releases client', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(1, {dateReceived: '2024-01'});

    expect(client.release.mock.calls).toHaveLength(1);
  });

  test('uses postgres transaction', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(1, {dateReceived: '2024-01'});

    expect(client.query.mock.calls[0][0]).toBe('BEGIN');
    expect(client.query.mock.calls[2][0]).toBe('COMMIT');
  });

  test('dateReceived only', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // UPDATE
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(1, {dateReceived: '2024-01'});

    const args = client.query.mock.calls[1];
    expect(args[0]).toBe('UPDATE testimonies SET date_received = $1 WHERE testimony_id = $2');
    expect(args[1][0]).toBe('2024-01');
    expect(args[1][1]).toBe(1);
  });

  test('dateReceived and gender', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // UPDATE
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(1, {dateReceived: '2024-01', gender: 'Male'});

    const args = client.query.mock.calls[1];
    expect(args[0]).toBe('UPDATE testimonies SET date_received = $1, gender = $2 WHERE testimony_id = $3');
    expect(args[1][0]).toBe('2024-01');
    expect(args[1][1]).toBe('Male');
    expect(args[1][2]).toBe(1);
  });

  test('dateReceived, lengthOfStay and gender', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // UPDATE
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(10, {dateReceived: '2024-01', lengthOfStay: 5, gender: 'Male'});

    const args = client.query.mock.calls[1];
    expect(args[0]).toBe('UPDATE testimonies SET date_received = $1, length_of_stay = $2, gender = $3 WHERE testimony_id = $4');
    expect(args[1][0]).toBe('2024-01');
    expect(args[1][1]).toBe(5);
    expect(args[1][2]).toBe('Male');
    expect(args[1][3]).toBe(10);
  });

  test('delete divisions', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // DELETE
        .mockReturnValueOnce(null) // INSERT
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(9, {divisions: ['A']});
    
    const args = client.query.mock.calls[1];
    expect(args[0]).toBe('DELETE FROM testimony_divisions WHERE testimony_id = $1');
    expect(args[1][0]).toBe(9);
  });

  test('insert single new division', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // DELETE
        .mockReturnValueOnce(null) // INSERT
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(9, {divisions: ['A']});
    
    const args = client.query.mock.calls[2];
    expect(args[0]).toBe('INSERT INTO testimony_divisions (testimony_id, division_id) VALUES ($1, (SELECT id FROM divisions WHERE name = $2))');
    expect(args[1][0]).toBe(9);
    expect(args[1][1]).toBe('A');
  });

  test('insert three new division', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // DELETE
        .mockReturnValueOnce(null) // INSERT
        .mockReturnValueOnce(null) // INSERT
        .mockReturnValueOnce(null) // INSERT
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(9, {divisions: ['B', 'C', 'D']});
    
    let args = client.query.mock.calls[2];
    expect(args[0]).toBe('INSERT INTO testimony_divisions (testimony_id, division_id) VALUES ($1, (SELECT id FROM divisions WHERE name = $2))');
    expect(args[1][0]).toBe(9);
    expect(args[1][1]).toBe('B');

    args = client.query.mock.calls[3];
    expect(args[0]).toBe('INSERT INTO testimony_divisions (testimony_id, division_id) VALUES ($1, (SELECT id FROM divisions WHERE name = $2))');
    expect(args[1][0]).toBe(9);
    expect(args[1][1]).toBe('C');

    args = client.query.mock.calls[4];
    expect(args[0]).toBe('INSERT INTO testimony_divisions (testimony_id, division_id) VALUES ($1, (SELECT id FROM divisions WHERE name = $2))');
    expect(args[1][0]).toBe(9);
    expect(args[1][1]).toBe('D');
  });

  test('delete all old sentences', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // DELETE
        .mockReturnValueOnce({rows: [{id: 1}]}) // INSERT sentence
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(9, {transcription: [
      {text: 'This is a sentence.', categories: []}
    ]});

    const args = client.query.mock.calls[1];
    expect(args[0]).toBe('DELETE FROM testimony_sentences WHERE testimony_id = $1');
    expect(args[1][0]).toBe(9);
  });

  test('insert new sentence with no categories', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // DELETE
        .mockReturnValueOnce({rows: [{id: 1}]}) // INSERT sentence
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(9, {transcription: [
      {text: 'This is a sentence.', categories: []}
    ]});

    const args = client.query.mock.calls[2];
    expect(args[0]).toBe('INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id');
    expect(args[1][0]).toBe('This is a sentence.');
    expect(args[1][1]).toBe(9);
  });

  test('insert new sentence with two categories', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // DELETE
        .mockReturnValueOnce({rows: [{id: 1}]}) // INSERT sentence
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(9, {transcription: [
      {text: 'This is a sentence.', categories: ['A', 'B']}
    ]});

    let args = client.query.mock.calls[2];
    expect(args[0]).toBe('INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id');
    expect(args[1][0]).toBe('This is a sentence.');
    expect(args[1][1]).toBe(9);

    args = client.query.mock.calls[3];
    expect(args[0]).toBe('INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))');
    expect(args[1][0]).toBe(1);
    expect(args[1][1]).toBe('A');

    args = client.query.mock.calls[4];
    expect(args[0]).toBe('INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))');
    expect(args[1][0]).toBe(1);
    expect(args[1][1]).toBe('B');
  });

  test('insert multiple sentences with multiple categories', async () => {
    client = {
      query: jest.fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null) // DELETE
        .mockReturnValueOnce({rows: [{id: 1}]}) // INSERT sentence
        .mockReturnValueOnce({rows: [{id: 2}]}) // INSERT sentence
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);

    await updateTestimony(9, {transcription: [
      {text: 'This is a sentence.', categories: []},
      {text: 'This is another sentence bilbo.', categories: ['A', 'B', 'D']}
    ]});

    let args = client.query.mock.calls[2];
    expect(args[0]).toBe('INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id');
    expect(args[1][0]).toBe('This is a sentence.');
    expect(args[1][1]).toBe(9);

    args = client.query.mock.calls[3];
    expect(args[0]).toBe('INSERT INTO testimony_sentences (sentence, testimony_id) VALUES ($1, $2) RETURNING id');
    expect(args[1][0]).toBe('This is another sentence bilbo.');
    expect(args[1][1]).toBe(9);

    args = client.query.mock.calls[4];
    expect(args[0]).toBe('INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))');
    expect(args[1][0]).toBe(2);
    expect(args[1][1]).toBe('A');

    args = client.query.mock.calls[5];
    expect(args[0]).toBe('INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))');
    expect(args[1][0]).toBe(2);
    expect(args[1][1]).toBe('B');

    args = client.query.mock.calls[6];
    expect(args[0]).toBe('INSERT INTO testimony_sentences_categories (sentence_id, category_id) VALUES ($1, (SELECT id FROM categories WHERE $2 = name))');
    expect(args[1][0]).toBe(2);
    expect(args[1][1]).toBe('D');
  });
});