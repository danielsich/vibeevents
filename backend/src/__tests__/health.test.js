const request = require('supertest');

// Set test env BEFORE requiring app so mongoose skips connection
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

const app = require('../index');

describe('GET /api/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'eventflow-api',
    });
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('GET /unknown-route', () => {
  it('should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});
