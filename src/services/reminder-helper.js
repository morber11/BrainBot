// oh my goodness
const DURATION_MULTIPLIERS = {
    s: 1000,
    sec: 1000,
    secs: 1000,
    second: 1000,
    seconds: 1000,
    m: 60 * 1000,
    min: 60 * 1000,
    mins: 60 * 1000,
    minute: 60 * 1000,
    minutes: 60 * 1000,
    h: 60 * 60 * 1000,
    hr: 60 * 60 * 1000,
    hrs: 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
};

// parses durations like "3h", "15 minutes", "2 days", etc
// so we don't need to force someone to give an iso string every time
function parseDuration(value, now) {
    if (!value) return null;

    const normalized = value.trim().toLowerCase();
    const match = normalized.match(/^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)?$/);

    if (!match) return null;

    const amount = Number(match[1]);
    if (Number.isNaN(amount) || amount <= 0) return null;

    const unit = match[2] || 'h';
    return new Date(now.getTime() + amount * DURATION_MULTIPLIERS[unit]);
}

function parseIso(value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/*
 default reminder selection logic if no time is given:
 - morning (before 12:00): default to now + 3 hours. if that goes beyond noon (12:00), default to noon
     e.g. 08:00 -> 11:00; 09:00/10:00/11:00 -> 12:00 (noon)
 - afternoon (12:00 - 18:00): default to now + 3 hours. if that goes beyond evening (18:00), default to evening
     e.g. 15:00 -> 18:00; 16:00 -> 18:00
 - evening (after 18:00): schedule for tomorrow morning at 09:00
*/
function getContextualDefaultReminderTime(now) {
    const current = new Date(now);
    const hour = current.getHours();
    const plusThree = new Date(current.getTime() + 3 * 60 * 60 * 1000);

    if (hour < 12) {
        const noon = new Date(current);
        noon.setHours(12, 0, 0, 0);
        return plusThree < noon ? plusThree : noon;
    }

    if (hour < 18) {
        const evening = new Date(current);
        evening.setHours(18, 0, 0, 0);
        return plusThree < evening ? plusThree : evening;
    }

    const tomorrowMorning = new Date(current);
    tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
    tomorrowMorning.setHours(9, 0, 0, 0);

    return tomorrowMorning;
}

function getReminderTime(timeInput, now) {
    if (!timeInput) return getContextualDefaultReminderTime(now);

    return parseDuration(timeInput, now) || parseIso(timeInput);
}

function formatReminderTime(date) {
    return new Intl.DateTimeFormat('en-IE', { // not sure how i feel about hardcoding en-IE but works for now
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

module.exports = {
    parseDuration,
    parseIso,
    getReminderTime,
    getContextualDefaultReminderTime,
    formatReminderTime,
};
