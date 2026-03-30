const { isValidAppointmentStatus } = require('../src/services/doctorPanelService');

describe('doctorPanelService status validation', () => {
    test('accepts valid statuses', () => {
        expect(isValidAppointmentStatus('COMPLETED')).toBe(true);
        expect(isValidAppointmentStatus('NO_SHOW')).toBe(true);
        expect(isValidAppointmentStatus('CANCELLED')).toBe(true);
    });

    test('rejects invalid statuses', () => {
        expect(isValidAppointmentStatus('DONE')).toBe(false);
        expect(isValidAppointmentStatus('UNKNOWN')).toBe(false);
    });
});
