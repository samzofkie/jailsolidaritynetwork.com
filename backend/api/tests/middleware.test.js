const crypto = require('crypto');

const db = require('../src/db.js');
const {
  verifyRequestBodyData,
  verifyLoginCredentials,
  verifyTestimonyId,
} = require('../src/middleware.js');

jest.mock('../src/db.js');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn();
  return res;
}

function expectMiddlewareToSendError(res, next) {
  expect(res.status.mock.calls).toHaveLength(1);
  expect(res.status.mock.calls[0][0]).toBeGreaterThanOrEqual(400);
  expect(res.json.mock.calls).toHaveLength(1);
  expect(res.json.mock.calls[0][0]?.error?.message).toBeDefined();
  expect(next.mock.calls).toHaveLength(0);
}

function expectMiddlewareSuccess(res, next) {
  expect(res.status.mock.calls).toHaveLength(0);
  expect(res.json.mock.calls).toHaveLength(0);
  expect(next.mock.calls).toHaveLength(1);
}

test('verifyRequestBodyData ill-formed', () => {
  const req = {body: {}};
  const res = mockRes();
  const next = jest.fn();

  verifyRequestBodyData(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyRequestBodyData well formed', () => {
  const req = {body: {data: {}}};
  const res = mockRes();
  const next = jest.fn();

  verifyRequestBodyData(req, res, next);
  expectMiddlewareSuccess(res, next);
});

test('verifyLoginCredentials ill-formed', async () => {
  const req = {body: {data: {username: 'user name', password: 'pw'}}};
  const res = mockRes();
  const next = jest.fn();

  await verifyLoginCredentials(req, res, next);
  expectMiddlewareToSendError(res, next);
})

test('verifyLoginCredentials no username', async () => {
  const req = {body: {data: {password: 'password'}}};
  const res = mockRes();
  const next = jest.fn();

  await verifyLoginCredentials(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyLoginCredentials no password', async () => {
  const req = {body: {data: {username: 'username'}}};
  const res = mockRes();
  const next = jest.fn();

  await verifyLoginCredentials(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyLoginCredentials invalid username', async () => {
  const req = {body: {data: {username: 'username', password: 'password'}}};
  const res = mockRes();
  const next = jest.fn();
  db.query.mockResolvedValue({rows: []});

  await verifyLoginCredentials(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyLoginCredentials invalid password', async () => {
  const req = {body: {data: {username: 'username', password: 'password'}}};
  const res = mockRes();
  const next = jest.fn();
  
  const salt = crypto.randomBytes(20);
  const hash = crypto.pbkdf2Sync('notpassword', salt, 10000, 64, 'sha3-512');
  db.query.mockResolvedValue({
    rows: [
      {
        salt: salt.toString('hex'), 
        hash: hash.toString('hex'),
      }
    ]
  });

  await verifyLoginCredentials(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyLoginCredentials success', async () => {
  const req = {body: {data: {username: 'username', password: 'password'}}};
  const res = mockRes();
  const next = jest.fn();
  
  const salt = crypto.randomBytes(20);
  const hash = crypto.pbkdf2Sync('password', salt, 10000, 64, 'sha3-512');
  db.query.mockResolvedValue({
    rows: [
      {
        salt: salt.toString('hex'), 
        hash: hash.toString('hex'),
      }
    ]
  });

  await verifyLoginCredentials(req, res, next);
  expectMiddlewareSuccess(res, next);
});

test('verifyTestimonyId undefined', async () => {
  const req = {params: {}};
  const res = mockRes();
  const next = jest.fn()

  await verifyTestimonyId(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyTestimonyId ill-formed', async () => {
  const req = {params: {testimonyId: '-1'}};
  const res = mockRes();
  const next = jest.fn()

  await verifyTestimonyId(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyTestimonyId ill-formed 2', async () => {
  const req = {params: {testimonyId: 's'}};
  const res = mockRes();
  const next = jest.fn()

  await verifyTestimonyId(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyTestimonyId invalid id', async () => {
  const req = {params: {testimonyId: '5'}};
  const res = mockRes();
  const next = jest.fn()
  db.query.mockResolvedValue({rows: []});

  await verifyTestimonyId(req, res, next);
  expectMiddlewareToSendError(res, next);
});

test('verifyTestimonyId invalid id', async () => {
  const req = {params: {testimonyId: '5'}};
  const res = mockRes();
  const next = jest.fn()
  db.query.mockResolvedValue({
    rows: [
      {
        id: 5,
        date_received: '2024-01-01T00:00:00.000Z',
        length_of_stay: 5,
        gender: 'Female',
      }
    ]
  });

  await verifyTestimonyId(req, res, next);
  expectMiddlewareSuccess(res, next);
  expect(req.currentTestimonyObject.testimonyId).toBe(5);
  expect(req.currentTestimonyObject.dateReceived).toBe('2024-01');
  expect(req.currentTestimonyObject.lengthOfStay).toBe(5);
  expect(req.currentTestimonyObject.gender).toBe('Female');
});