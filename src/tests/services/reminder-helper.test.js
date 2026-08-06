const reminderHelper = require('../../services/reminder-helper.js');

describe('reminder-helper', () => {
    it('parses duration with hours', () => {
        const now = new Date('2026-05-19T00:00:00Z');
        const result = reminderHelper.parseDuration('3h', now);
        expect(result.getTime()).to.equal(now.getTime() + 3 * 60 * 60 * 1000);
    });

    it('parses duration with minutes and words', () => {
        const now = new Date('2026-05-19T00:00:00Z');
        const result = reminderHelper.parseDuration('15 minutes', now);
        expect(result.getTime()).to.equal(now.getTime() + 15 * 60 * 1000);
    });

    it('returns null for invalid duration', () => {
        const now = new Date();
        expect(reminderHelper.parseDuration('zero', now)).to.be.null;
        expect(reminderHelper.parseDuration('', now)).to.be.null;
    });

    it('parses ISO timestamps', () => {
        const iso = '2026-05-20T10:00:00Z';
        const result = reminderHelper.parseIso(iso);
        expect(result).to.be.instanceOf(Date);
        expect(result.toISOString()).to.equal('2026-05-20T10:00:00.000Z');
    });

    it('computes contextual default before noon', () => {
        const now = new Date('2026-05-19T08:00:00Z'); // 8:00
        const expected = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3h => 11:00
        const result = reminderHelper.getContextualDefaultReminderTime(now);
        expect(result.getTime()).to.equal(expected.getTime());
    });

    it('computes contextual default after evening', () => {
        const now = new Date('2026-05-19T20:00:00Z'); // 20:00
        const result = reminderHelper.getContextualDefaultReminderTime(now);
        expect(result.getHours()).to.equal(9);
    });

    it('formats reminder times into a string', () => {
        const dt = new Date('2026-05-20T10:00:00Z');
        const formatted = reminderHelper.formatReminderTime(dt);
        expect(formatted).to.be.a('string');
        expect(formatted.length).to.be.greaterThan(0);
    });

    it('creates a reminder schedule with alert time', () => {
        const now = new Date('2026-05-19T00:00:00Z');
        const result = reminderHelper.createReminderSchedule({
            timeInput: '1h',
            now,
            alertOffsetMinutes: 15,
        });

        expect(result.remindAt.toISOString()).to.equal('2026-05-19T01:00:00.000Z');
        expect(result.alertAt.toISOString()).to.equal('2026-05-19T00:45:00.000Z');
    });

    it('returns null for invalid reminder schedules', () => {
        const result = reminderHelper.createReminderSchedule({
            timeInput: 'bad-time',
            now: new Date('2026-05-19T00:00:00Z'),
            alertOffsetMinutes: 15,
        });

        expect(result).to.equal(null);
    });
});
