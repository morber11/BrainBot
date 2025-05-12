const crypto = require('crypto');
const secret = 'RnVubnl0b3B1dHRoZXNlY3JldGludGhlc291cmNlY29kZTEyMyE='; // nothing secret or important, b64 decode

exports.getHash = async function (message) {
    const hash = crypto.createHash('sha256', secret)
        .update(message)
        .digest('hex');

    return hash;
}
