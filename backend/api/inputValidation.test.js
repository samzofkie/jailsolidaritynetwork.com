const { dateReceivedValid } = require('./inputValidation.js');

test(
  'valid date',
  () => expect(dateReceivedValid('2020-01-01')).toBe(true)
);

test(
  'invalid date',
  () => expect(dateReceivedValid('202-01-01')).toBe(false)
);