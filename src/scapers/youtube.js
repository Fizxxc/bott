/**
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @xyzendev - Adriansyah
 *  © 2024 by @xyzendev - Adriansyah | MIT License
 */

import { Crypto, fs, ytdl, yts } from "@xyzendev/modules/core/main.modules.js"

/**
 *  Download Youtube Video as MP3
 * @param {import('@xyzendev/baileys').WAConnection} client
 * @param {import('@xyzendev/baileys').proto.WebMessageInfo} m
 * @param {string} url
 */
export async function ytmp3(client, m, url) {
    try {
        await ytdl.getInfo(url);
        let a = "./src/temp/" + Crypto.randomBytes(4).toString('hex') + ".mp3";
        let b = await ytdl(url, {
            filter: "audioonly"
        }).pipe(fs.createWriteStream(a)).on("finish", async () => {
            await client.sendMessage(m.from, {
                audio: fs.readFileSync(a),
                mimetype: "audio/mp4",
                ptt: false
            }, { quoted: m, sendEphemeral: true })
        })
        return b
    } catch (e) {
        return e
    }
}

/**
 *  Download Youtube Video as MP4
 * @param {import('@xyzendev/baileys').WAConnection} client
 * @param {import('@xyzendev/baileys').proto.WebMessageInfo} m
 * @param {string} url
 */

export async function ytmp4(client, m, url) {
    try {
        await ytdl.getInfo(url);
        let a = "./src/temp/" + Crypto.randomBytes(4).toString('hex') + ".mp4";
        let b = await ytdl(url, {
            filter: "videoandaudio"
        }).pipe(fs.createWriteStream(a)).on("finish", async () => {
            const stats = fs.statSync(a);
            const fileSizeInBytes = stats.size;
            const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
            if (fileSizeInMB < 50) {
                await client.sendMessage(m.from, {
                    video: fs.readFileSync(a),
                    mimetype: "video/mp4",
                }, { quoted: m, sendEphemeral: true });
            } else {
                await client.sendMessage(m.from, { text: "File size exceeds 50MB limit." }, { quoted: m, sendEphemeral: true });
            }
        });
        return b;
    } catch (e) {
        return e;
    }
}

export async function search(query) {
    try {
        const result = {};
        const a = await yts(query);
        const b = a.videos[0];
        result.url = b.url;
        result.title = b.title;
        result.duration = b.seconds;
        result.views = b.views;
        result.thumbnail = b.image;
        result.date = b.ago;
        result.author = b.author.name;
        result.author_url = b.author.url;
        result.description = b.description;
        return result;
    } catch (e) {
        console.error(e)
        return null
    }
}