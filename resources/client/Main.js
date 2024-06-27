/**
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @choxzyndev - Rasya
 *  © 2024 by @choxzydev - Rasya | MIT License
 */
import makeWASocket, { delay, useMultiFileAuthState, fetchLatestWaWebVersion, makeInMemoryStore, jidNormalizedUser, PHONENUMBER_MCC, DisconnectReason, Browsers, makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import { Config, smsg, Module, treeKill } from "../index.js"
import cfonts from "cfonts";
import fs from "fs";
import pino from "pino";
import { Boom } from "@hapi/boom"
import { exec } from "child_process";

// Configuration System To Connect to the server
const logger = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({ class: "choco" })
logger.level = "fatal"

// const pathContacts = "./resources/database/contacts.json";
// const pathMetadata = "./resources/database/metadata.json";
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in config.APIs ? config.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname] : config.APIKeys[name in config.APIs ? config.APIs[name] : name] } : {}) })) : '');

const usePairing = Config.usePairingCode
const store = makeInMemoryStore({ logger });
const database = (new (await import('../../lib/database.js')).default());

if (Config.Settings.write_store) store.readFromFile("./resources/database/store.json")

console.clear();
// Console Log
cfonts.say("choco-md", {
    font: "tiny",
    align: "center",
    colors: ["green"]
});


const Connecting = async () => {
    const content = await database.read()
        if (content && Object.keys(content).length === 0) {
        global.db = {
        users: {},
        groups: {},
        setting: {},
        ...(content || {}),
    }
    await database.write(global.db)
    } else {
        global.db = content
     }
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(`./resources/Session`)
    const {
        version
    } = await fetchLatestWaWebVersion()

    const client = makeWASocket.default({
        version,
        logger,
        printQRInTerminal: !usePairing,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: Browsers.macOS("Safari"),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        retryRequestDelayMs: 10,
        transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
        defaultQueryTimeoutMs: undefined,
        maxMsgRetryCount: 15,
        appStateMacVerification: {
            patch: true,
            snapshot: true,
        },
        getMessage: async key => {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);


            return msg?.message || list || '';
        },
        shouldSyncHistoryMessage: msg => {
            console.log(`\x1b[32mMemuat Chat [${msg.progress}%]\x1b[39m`);
            return !!msg.syncType;
        },
    });

    store.bind(client.ev);

    await Module({
        client,
        store
    });

    if (usePairing && !client.authState.creds.registered) {
        console.clear();
        let number = Config.Information.Bot.number;
        let phoneNumber = number.replace(/[^0-9]/g, '')

        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) throw "Start with your country's WhatsApp code, Example : 62xxx";

        await delay(5000);
        let code = await client.requestPairingCode(phoneNumber);
        console.log("Pairing Code : " + `\x1b[32m${code?.match(/.{1,4}/g)?.join("-") || code}\x1b[39m`);
    }

    client.ev.on("connection.update", (update) => {
        const {
            lastDisconnect,
            connection,
            qr
        } = update
        if (connection) {
            console.info(`Connection Status : ${connection}`)
        }


        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode

            switch (reason) {
                case DisconnectReason.badSession:
                    console.info(`Bad Session File, Restart Required`)
                    Connecting()
                    break
                case DisconnectReason.connectionClosed:
                    console.info("Connection Closed, Restart Required")
                    Connecting()
                    break
                case DisconnectReason.connectionLost:
                    console.info("Connection Lost from Server, Reconnecting...")
                    Connecting()
                    break
                case DisconnectReason.connectionReplaced:
                    console.info("Connection Replaced, Restart Required")
                    Connecting()
                    break
                case DisconnectReason.restartRequired:
                    console.info("Restart Required, Restarting...")
                    Connecting()
                    break
                case DisconnectReason.loggedOut:
                    console.error("Device has Logged Out, please rescan again...")
                    client.end()
                    fs.rmSync(`./resources/Session`, {
                        recursive: true,
                        force: true
                    })
                    exec("npm run stop:pm2", (err) => {
                        if (err) return treeKill(process.pid)
                    })
                    break
                case DisconnectReason.multideviceMismatch:
                    console.error("Need Multi Device Version, please update and rescan again...")
                    client.end()
                    fs.rmSync(`./resources/Session`, {
                        recursive: true,
                        force: true
                    })
                    exec("npm run stop:pm2", (err) => {
                        if (err) return treeKill(process.pid)
                    })
                    break
                default:
                    console.log("I don't understand this issue")
                    Connecting()
            }
        }

        if (connection === "open") {
            console.clear();
            cfonts.say("Connected successfully", {
                font: "tiny",
                align: "left",
                colors: ["blue"]
            });
            console.log(`Don't sell this script`);
        }
    })

    client.ev.on("creds.update", saveCreds)

    /*
    if (fs.existsSync(pathContacts)) {
        store.contacts = JSON.parse(fs.readFileSync(pathContacts, 'utf-8'));
    } else {
        fs.writeFileSync(pathContacts, JSON.stringify({}, null, 2));
    }

    if (fs.existsSync(pathMetadata)) {
        store.groupMetadata = JSON.parse(fs.readFileSync(pathMetadata, 'utf-8'));
    } else {
        fs.writeFileSync(pathMetadata, JSON.stringify({}, null, 2));
    }
    */

    client.ev.on("contacts.update", (update) => {
        for (let contact of update) {
            let id = jidNormalizedUser(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                ...(store.contacts?.[id] || {}),
                ...(contact || {})
            }
        }
    })
    client.ev.on("contacts.upsert", (update) => {
        for (let contact of update) {
            let id = jidNormalizedUser(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                ...(contact || {}),
                isContact: true
            }
        }
    })

    client.ev.on("groups.update", (updates) => {
        for (const update of updates) {
            const id = update.id
            if (store.groupMetadata[id]) {
                store.groupMetadata[id] = {
                    ...(store.groupMetadata[id] || {}),
                    ...(update || {})
                }
            }
        }
    })

    client.ev.on('group-participants.update', ({
        id,
        participants,
        action
    }) => {
        const metadata = store.groupMetadata[id]
        if (metadata) {
            switch (action) {
                case 'add':
                case "revoked_membership_requests":
                    metadata.participants.push(...participants.map(id => ({
                        id: jidNormalizedUser(id),
                        admin: null
                    })))
                    break
                case 'demote':
                case 'promote':
                    for (const participant of metadata.participants) {
                        let id = jidNormalizedUser(participant.id)
                        if (participants.includes(id)) {
                            participant.admin = (action === "promote" ? "admin" : null)
                        }
                    }
                    break
                case 'remove':
                    metadata.participants = metadata.participants.filter(p => !participants.includes(jidNormalizedUser(p.id)))
                    break
            }
        }
    })

    client.ev.on("messages.upsert", async ({
        messages
    }) => {
        if (!messages[0].message) return
        let m = await smsg(client, messages[0], store)
        if (store.groupMetadata && Object.keys(store.groupMetadata).length === 0) store.groupMetadata = await client.groupFetchAllParticipating()
        if (m.key && !m.key.fromMe && m.key.remoteJid === "status@broadcast") {
            if (m.type === "protocolMessage" && m.message.protocolMessage.type === 0) return
            await client.readMessages([m.key])
        }

        if (Config.Settings.self === "false" && m.isOwner) return;

        await ((await import(`./Message.js?v=${Date.now()}`)).default(client, store, m, messages[0]))
    });

    setInterval(async () => {
        if (Config.Settings.write_store) {
            //if (store.groupMetadata) fs.writeFileSync(pathMetadata, JSON.stringify(store.groupMetadata, null, 2));
            // if (store.contacts) fs.writeFileSync(pathContacts, JSON.stringify(store.contacts, null, 2));
            store.writeToFile("./resources/database/store.json", true)
        }
    }, 10 * 1000)

      // rewrite database every 30 seconds
    setInterval(async () => {
        if (global.db) await database.write(global.db)
    }, 30000) // write database every 30 seconds

    process.on("uncaughtException", console.error)
    process.on("unhandledRejection", console.error)
}

Connecting();