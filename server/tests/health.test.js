const request = require('supertest');
const express = require('express');
const app = express();

// Dummy route for test setup verification
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

describe('GET /api/health', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('ok');
    });
});
