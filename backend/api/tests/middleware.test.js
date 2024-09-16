const crypto = require('crypto');

const db = require('../src/db.js');
const {
  verifyRequestBodyData,
  verifyLoginCredentials,
  verifyTestimonyId,
} = require('../src/middleware.js');

jest.mock('../src/db.js');

async function callMiddleware(req, middleware) {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn();

  const next = jest.fn();

  await middleware(req, res, next);

  return [res, next];
}

function expectMiddlewareToSendError(res, next) {
  expect(res.status.mock.calls).toHaveLength(1);
  expect(res.status.mock.calls[0][0]).toBeGreaterThanOrEqual(400);
  expect(res.json.mock.calls).toHaveLength(1);
  expect(res.json.mock.calls[0][0]?.error?.message).toBeDefined();
  expect(next.mock.calls).toHaveLength(0);
}

function expectMiddlewareToCallNext(res, next) {
  expect(res.status.mock.calls).toHaveLength(0);
  expect(res.json.mock.calls).toHaveLength(0);
  expect(next.mock.calls).toHaveLength(1);
}

describe('verifyRequestBodyData', () => {
  test('body lacking data property', async () => {
    const req = {body: {}};
    const [res, next] = await callMiddleware(req, verifyRequestBodyData);
    expectMiddlewareToSendError(res, next);
  });
  
  test('body has data property', async () => {
    const req = {body: {data: {}}};
    const [res, next] = await callMiddleware(req, verifyRequestBodyData);
    expectMiddlewareToCallNext(res, next);
  });
});

describe('verifyLoginCredentials', () => {
  test('whitespace in username', async () => {
    const req = {body: {data: {username: 'user name', password: 'pw'}}};
    const [res, next] = await callMiddleware(req, verifyLoginCredentials);
    expectMiddlewareToSendError(res, next);
  })
  
  test('no username', async () => {
    const req = {body: {data: {password: 'password'}}};
    const [res, next] = await callMiddleware(req, verifyLoginCredentials);
    expectMiddlewareToSendError(res, next);
  });
  
  test('no password', async () => {
    const req = {body: {data: {username: 'username'}}};
    const [res, next] = await callMiddleware(req, verifyLoginCredentials);
    expectMiddlewareToSendError(res, next);
  });
  
  test('invalid username', async () => {
    const req = {body: {data: {username: 'username', password: 'password'}}};
    db.query.mockResolvedValue({rows: []});

    const [res, next] = await callMiddleware(req, verifyLoginCredentials);
    expectMiddlewareToSendError(res, next);
  });
  
  test('invalid password', async () => {
    const req = {body: {data: {username: 'username', password: 'password'}}};    
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
  
    const [res, next] = await callMiddleware(req, verifyLoginCredentials);
    expectMiddlewareToSendError(res, next);
  });
  
  test('valid username and password', async () => {
    const req = {body: {data: {username: 'username', password: 'password'}}};
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
  
    const [res, next] = await callMiddleware(req, verifyLoginCredentials);
    expectMiddlewareToCallNext(res, next);
  });
});

describe('verifyTestimonyId', () => {
  test('parameter undefined', async () => {
    const req = {params: {}};
    const [res, next] = await callMiddleware(req, verifyTestimonyId);
    expectMiddlewareToSendError(res, next);
  });
  
  test('invalid parameter syntax', async () => {
    const req = {params: {testimonyId: '-1'}};
    const [res, next] = await callMiddleware(req, verifyTestimonyId);
    expectMiddlewareToSendError(res, next);
  });
  
  test('string parameter', async () => {
    const req = {params: {testimonyId: 's'}};
    const [res, next] = await callMiddleware(req, verifyTestimonyId);
    expectMiddlewareToSendError(res, next);
  });
  
  test('invalid id', async () => {
    const req = {params: {testimonyId: '5'}};
    db.query.mockResolvedValue({rows: []});
  
    const [res, next] = await callMiddleware(req, verifyTestimonyId);
    expectMiddlewareToSendError(res, next);
  });
  
  test('valid id', async () => {
    const req = {params: {testimonyId: '5'}};
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
  
    const [res, next] = await callMiddleware(req, verifyTestimonyId);
    expectMiddlewareToCallNext(res, next);
    expect(req.currentTestimonyObject.testimonyId).toBe(5);
    expect(req.currentTestimonyObject.dateReceived).toBe('2024-01');
    expect(req.currentTestimonyObject.lengthOfStay).toBe(5);
    expect(req.currentTestimonyObject.gender).toBe('Female');
  });
});