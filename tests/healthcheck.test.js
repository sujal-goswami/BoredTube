import request from 'supertest';
import { app } from '../src/app.js';

describe('Healthcheck test', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/api/v1/healthcheck');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('statusCode', true);
        expect(res.body).toHaveProperty('data', 'OK');
        expect(res.body).toHaveProperty('message', 'Health check passed');
    });
});