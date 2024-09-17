const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../src/db.js');
const {
  verifyRequestBodyData,
  verifyLoginCredentials,
  verifyTestimonyId,
  authenticateToken,
  validateTestimonyWriteObject,
} = require('../src/middleware.js');

jest.mock('../src/db.js');
jest.mock('jsonwebtoken');

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

describe('authenticateToken', () => {
  test('no authorization header', async () => {
    const req = {headers: {}};
    const [res, next] = await callMiddleware(req, authenticateToken);
    expectMiddlewareToSendError(res, next);
  });

  test('authorization header ill-formed', async () => {
    const req = {headers: {authorization: 'Bearer'}};
    const [res, next] = await callMiddleware(req, authenticateToken);
    expectMiddlewareToSendError(res, next);
  })

  test('invalid token', async () => {
    const req = {headers: {authorization: 'Bearer token'}};
    jwt.verify = jest.fn(() => {throw new Error;});

    const [res, next] = await callMiddleware(req, authenticateToken);
    expectMiddlewareToSendError(res, next);
  });

  test('invalid token', async () => {
    const req = {headers: {authorization: 'Bearer token'}};
    jwt.verify = jest.fn(() => 'payload');

    const [res, next] = await callMiddleware(req, authenticateToken);
    expectMiddlewareToCallNext(res, next);
    expect(req.jwtPayload).toBe('payload');
  });
});

describe('validateTestimonyWriteObject', () => {
  function testNameAndDataToError(testName, data) {
    test(
      testName,
      async () => {
        req = {body: {data: data}};
        const [res, next] = await callMiddleware(req, validateTestimonyWriteObject);
        expectMiddlewareToSendError(res, next);
      }
    )
  }

  [
    ['all fields empty', {}],
    ['dateReceived ill-formed', {dateReceived: '2024-01-10'}],
    ['lengthOfStay ill-formed', {lengthOfStay: ' 10'}],
    ['gender invalid', {gender: 'Male '}],
    ['transcription empty', {transcription: []}],
  ].map(pair => testNameAndDataToError(...pair));

  test('invalid division', async () => {
    const req = {body: {data: {divisions: ['1', '2', '3']}}};
    db.query.mockResolvedValue({rows: [{name: '1'}, {name: '2'}]});
    const [res, next] = await callMiddleware(req, validateTestimonyWriteObject);
    expectMiddlewareToSendError(res, next);
  });

  test('transcription sentence lacking text property', async () => {
    const req = {body: {data: {transcription: [{}]}}};
    db.query.mockResolvedValue({rows: [
      {name: 'category1'}, 
      {name: 'category2'}
    ]});
    const [res, next] = await callMiddleware(req, validateTestimonyWriteObject);
    expectMiddlewareToSendError(res, next);
  });

  test('transcription sentence has invalid property', async () => {
    const req = {body: {data: {transcription: [{
      text: 'text', 
      categories: ['category1'],
    }]}}};
    db.query.mockResolvedValue({rows: [
      {name: 'category2'}, 
      {name: 'category3'}
    ]});
    const [res, next] = await callMiddleware(req, validateTestimonyWriteObject);
    expectMiddlewareToSendError(res, next);
  });

  test('success', async () => {
    const req = {body: {data: {
      dateReceived: '2024-01',
      transcription: [
        {
          text: 'text', 
          categories: ['category1'],
        }
      ],
    }}};
    db.query.mockResolvedValue({rows: [
      {name: 'category1'}, 
      {name: 'category2'}
    ]});
    const [res, next] = await callMiddleware(req, validateTestimonyWriteObject);
    expectMiddlewareToCallNext(res, next);
  });
});