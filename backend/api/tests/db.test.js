const pg = require('pg');
const {
  pool,
  query,
  connect,
  selectAllTestimonies,
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