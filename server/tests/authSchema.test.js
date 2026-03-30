const { registerSchema, loginSchema } = require('../src/validations/authSchema');

describe('auth schema validation', () => {
    test('rejects weak password on register', () => {
        const result = registerSchema.safeParse({
            email: 'test@example.com',
            password: '12345678',
            name: 'Test User',
            tcNo: '12345678901'
        });
        expect(result.success).toBe(false);
    });

    test('accepts valid register payload', () => {
        const result = registerSchema.safeParse({
            email: 'test@example.com',
            password: 'Strong!123',
            name: 'Test User',
            tcNo: '12345678901'
        });
        expect(result.success).toBe(true);
    });

    test('rejects invalid login email', () => {
        const result = loginSchema.safeParse({
            email: 'invalid-email',
            password: 'Strong!123'
        });
        expect(result.success).toBe(false);
    });
});
