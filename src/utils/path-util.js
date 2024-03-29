const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    getMediaFilePath(dir, type, media) {
        return path.join(dir, '..', '..', 'media', type, media);
    }
}