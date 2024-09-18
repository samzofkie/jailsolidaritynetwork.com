const pg = require('pg');
const {
  pool,
  query,
  connect,
  selectAllTestimonies,
  insertTestimony,
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
    
      test('uses postgres transactions', async () => {
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