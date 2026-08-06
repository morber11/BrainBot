const LONG_MESSAGE_THRESHOLD = 70;

// statements
const LEADING_QUESTION_WORD_REGEX = /^(?:what|who|whom|whose|which|where|when|why|how)\b/i;
const LEADING_AUX_VERB_REGEX = /^(?:do|does|did|is|are|am|was|were|can|could|will|would|should|shall|may|might|must|have|has|had)\b/i;
// catches question words in the middle of sentences
const QUESTION_WORD_PLUS_AUX_REGEX = /\b(?:what|who|whom|whose|which|where|when|why|how)\s+(?:do|does|did|is|are|am|was|were|can|could|will|would|should|shall|may|might|must|have|has|had)\b/i;
const LEADING_MENTION_REGEX = /^(?:@\S+|<\S+>)\s*/g;

function isQuestion(content) {
    // ignore leading @mentions
    const withoutMentions = content.trim().replace(LEADING_MENTION_REGEX, '');

    return withoutMentions.endsWith('?')
        || LEADING_QUESTION_WORD_REGEX.test(withoutMentions)
        || LEADING_AUX_VERB_REGEX.test(withoutMentions)
        || QUESTION_WORD_PLUS_AUX_REGEX.test(withoutMentions);
}

function evaluateAskResponse({ content, roll }) {
    const original = content || '';
    const normalized = original.toLowerCase();

    if (normalized.includes("i didn't ask")) return { replyText: null };
    if (isQuestion(normalized)) return { replyText: null };

    const trimmed = original.trim();
    const isLong = trimmed.length > LONG_MESSAGE_THRESHOLD;
    const match = original.match(/^\s*i\s+\S+([\s\S]*)$/i);
    const isLeading = Boolean(match);
    const isKeyword = normalized.includes('ask') || normalized.includes('i did');

    if (!(isLong || isLeading || isKeyword)) return { replyText: "i didn't ask" };

    const optionalCount = (isLong ? 1 : 0) + (isLeading ? 1 : 0);
    const baseWeight = 100 - (optionalCount * 10);

    if (roll < baseWeight) return { replyText: "i didn't ask" };

    let remainderRoll = roll - baseWeight;
    if (isLong) {
        if (remainderRoll < 10) return { replyText: "that's a lot of words to not ask" };
        remainderRoll -= 10;
    }

    if (isLeading) {
        if (remainderRoll < 10) {
            const remainder = match[1] || '';
            return { replyText: "i didn't ask" + remainder };
        }
    }

    return { replyText: "i didn't ask" };
}

module.exports = {
    evaluateAskResponse,
};
