import { fs, path } from '@xyzendev/modules/core/main.modules.js';
import { spawn } from '@xyzendev/modules/core/second.modules.js';

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    return new Promise(async (resolve, reject) => {
        try {
            let tmp = path.join("../tmp", (+new Date()).toString(36) + Math.random().toString(36).substring(2, 5) + '.' + ext);
            let out = tmp + '.' + ext2;
            await fs.writeFile(tmp, buffer);
            spawn(ffmpegPath, [
                '-y',
                '-i', tmp,
                ...args,
                out
            ])
                .on('error', reject)
                .on('close', async (code) => {
                    try {
                        await fs.unlink(tmp);
                        if (code !== 0) return reject(code);
                        resolve(await fs.readFile(out));
                        await fs.unlink(out);
                    } catch (e) {
                        reject(e);
                    }
                });
        } catch (e) {
            reject(e);
        }
    });
}

function toAudio(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-ac', '2',
        '-b:a', '128k',
        '-ar', '44100',
        '-f', 'mp3'
    ], ext, 'mp3');
}
function toPTT(buffer, ext) {
    return ffmpeg(buffer, [
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '128k',
        '-vbr', 'on',
        '-compression_level', '10'
    ], ext, 'opus');
}
function toVideo(buffer, ext) {
    return ffmpeg(buffer, [
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-ab', '128k',
        '-ar', '44100',
        '-crf', '32',
        '-preset', 'slow'
    ], ext, 'mp4');
}

export {
    toAudio,
    toPTT,
    toVideo,
    ffmpeg,
};
