const { formatDate } = require('../src/utils.js');

test('formateDate no argument', () => {
  expect(() => formatDate()).toThrow();
});

test('formatDate empty string', () => {
  expect(() => formatDate('')).toThrow(Error);
});

test('formatDate year string', () => {
  const date = formatDate('2020');
  expect(date).toBe('2020-01');
});

test('formatDate postgres format', () => {
  const date = formatDate('2024-01-01T00:00:00.000Z');
  expect(date).toBe('2024-01');
});