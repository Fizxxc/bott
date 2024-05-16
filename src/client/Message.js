import { baileys, chalk, fs, util } from "@xyzendev/modules/core/main.modules.js";
import { fileURLToPath } from "url";
import { Config, infoServer, smsg } from "../index.js"
import * as Func from "../core/Function.js";
import Spotifydl from "../scapers/spotify.js";
import { search, ytmp3, ytmp4 } from "../scapers/youtube.js";
import { exec } from "@xyzendev/modules/core/second.modules.js";
import { processing } from "../scapers/upscale.js";
import { blackbox } from "../scapers/blackbox.js";
import { appenTextMessage } from "../core/Serialize.js";
import { randomUUID } from "crypto";

const { delay, jidNormalizedUser, getContentType, generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys;

const premium = JSON.parse(fs.readFileSync('./src/database/roles/premium.json'))
const antilink = JSON.parse(fs.readFileSync('./src/database/group/antilink.json'))
const antibadword = JSON.parse(fs.readFileSync('./src/database/group/antibadword.json'))


const badword = JSON.parse(fs.readFileSync('./src/database/function/badword.json'))

/**
 *
 * @export
 * @param {*} client
 * @param {*} store
 * @param {*} m
 * @return {*} 
 */

export default async function Message(client, store, m, chatUpdate) {
    try {
        if (!m) return
        if (m.from && db.groups[m.from]?.mute && !m.isOwner) return
        if (m.isBaileys) return
    
        (await import('../../lib/loadDatabase.js')).default(m)
        
        let body = (m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.type == 'interactiveResponseMessage') ? appenTextMessage(JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id, chatUpdate, m, client) : (m.type == 'templateButtonReplyMessage') ? appenTextMessage(m.msg.selectedId, chatUpdate, m, client) : (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
        let quoted = m.isQuoted ? m.quoted : m
        let Downloaded = async (fileName) => await client.downloadMediaMessage(quoted, fileName)
        let isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false
        let isPremium = premium.map(a => a).includes(m.sender.split("@")[0])

        // Function React by choco
        //let reactionMessage = baileys.proto.Message.reactionMessage.create({ key: m.key, text: ""})

        // Function For Group
        let isAntiLink = antilink.includes(m.from) && m.isGroup
        if (isAntiLink) {
            if (m.body.includes("whatsapp.com") || m.body.includes("wa.me") || m.body.includes("chat.whatsapp")) {
                if (m.isAdmin) return;
                if (m.isCreator) return;
                await client.sendMessage(m.from, { delete: quoted.key })
            }
        }
        
        let isAntiBadword = antibadword.includes(m.from) && m.isGroup
        if (isAntiBadword) {
            if (m.body.includes(badword)) {
                if (m.isAdmin) return;
                if (m.isCreator) return;
                await client.sendMessage(m.from, { delete: quoted.key })
            }
        }

        // AFK
    let jids = [...new Set([...(m.mentions || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    for (let jid of jids) {
      let user = db.users[jid]
      if (!user) continue
      let afkTime = user.afkTime
      if (!afkTime || afkTime < 0) continue
      let reason = user.afkReason || ''
      m.reply(`Jangan tag dia!\nDia sedang AFK ${reason ? 'dengan alasan ' + reason : 'tanpa alasan'} Selama ${Func.toTime(new Date - afkTime)}`)
    }

    if (db.users[m.sender].afkTime > -1) {
      let user = db.users[m.sender]
      m.reply(`Kamu berhenti AFK${user.afkReason ? ' setelah ' + user.afkReason : ''}\n\nSelama ${Func.toTime(new Date() - user.afkTime)}`)  
      user.afkTime = -1
      user.afkReason = ''
    }

        if (m.isBot) return;

        if (Config.Settings.read && isCommand) {
            await client.sendPresenceUpdate('available')
            client.readMessages([m.key])
        }
        if (!m.public) {
            if (!m.key.fromMe || m.isCreator) return;
        }
        if (m.message && !m.isBot) {
            const messageTypeEmoji = m.isGroup ? "ðŸ‘¥ Group" : "ðŸ‘¤ Private";
            const messageContent = m.body || m.type;
            console.log(
                `${chalk.blue("FROM")}: ${chalk.yellow(m.pushName + " => " + m.sender)}\n` +
                `${chalk.blue("IN")}: ${chalk.magenta(messageTypeEmoji)}\n` +
                `${chalk.blue("MESSAGE")}: ${chalk.green(messageContent)}\n` +
                `ðŸ•’ ${new Date().toLocaleTimeString()}`
            );
        }
        //Countdown
        const today = new Date();
        const ramadanStart = new Date(today.getFullYear(), 3, 12); 
        const ramadanEnd = new Date(today.getFullYear(), 4, 13); 
        //None
        client.autoshalat = client.autoshalat ? client.autoshalat : {};
        let who =
          m.mentionedJid && m.mentionedJid[0]
        ? m.mentionedJid[0]
        : m.fromMe
          ? client.user.id
          : m.sender;
        let id = m.chat;
        if (id in client.autoshalat) {
          return false;
        }
        let jadwalSholat = {
          Shubuh: "04:12",
          Dzuhur: "11:27",
          Ashar: "14:48",
          Maghrib: "17:20",
          Isya: "18:43",
          Tahajud: "00:04",
        };
        const datek = new Date(
          new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
          }),
        );
        const hours = datek.getHours();
        const minutes = datek.getMinutes();
        const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        for (let [sholat, waktu] of Object.entries(jadwalSholat)) {
          if (timeNow === waktu) {
        let caption = `ðŸ“¢ Hai Kak @${m.pushName}, *Waktu ${sholat}* telah tiba, ambilah air wudhu dan segeralah shalat ðŸ˜‡.\n\n*${waktu}*\n_Untuk wilayah JawaTimur dan sekitarnya._\n\n_Luangkan Waktu Mu Sejenak Untuk Mendekatkan Diri Kepada Yang Maha Kuasa_`;
        client.autoshalat[id] = [
          m.reply(caption),
          setTimeout(async() => {
        delete client.autoshalat[m.chat];
          }, 57000),
        ];
          }
        }
        // Check if the message is a command
        switch (isCommand ? m.command.toLowerCase() : false) {
            case "menu":
            case "help": {
                let text = `> Hello, ${m.pushName}! I'm an automated system (WhatsApp bot) that can assist with various tasks exclusively through WhatsApp.\n\nTotal Features: ${Object.values(Config.Menu).map(a => a.length).reduce((total, num) => total + num, 0)}\nTotal Sub-Menu: ${Object.keys(Config.Menu).length + 1}\n\n`
                let menu = "> .allmenu\n"
                for (const category in Config.Menu) {
                    menu += `> ${m.prefix}${category.toLowerCase()}menu\n`;
                }
                if (Config.Settings.typeMenu === 1) {
                    client.sendMessage(m.from, {
                        document: fs.readFileSync('./LICENSE'),
                        fileName: Config.Information.Bot.name,
                        caption: text + menu,
                        mimetype: 'application/html',
                        fileLength: Date.now(),
                        headerType: 24,
                        jpegThumbnail: fs.readFileSync('./src/assets/img/logo.png'),
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            mentionedJid: [m.sender],
                            forwardedNewsletterMessageInfo: {
                                newsletterName: "ðŸ¤– " + Config.Information.Bot.name,
                                newsletterJid: "120363265419579977@newsletter"
                            },
                            externalAdReply: {
                                title: Config.Settings.Title,
                                body: Config.Settings.Watermark,
                                thumbnail: fs.readFileSync('./src/assets/img/logo.png'),
                                thumbnailUrl: null,
                                showAdAttribution: true,
                                renderLargerThumbnail: true,
                                mediaType: 1
                            }
                        }
                    }, { quoted: m })
                } else if (Config.Settings.typeMenu === 2) {
                    client.sendMessage(m.from, {
                        text: text + menu,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            mentionedJid: [m.sender],
                            forwardedNewsletterMessageInfo: {
                                newsletterName: "ðŸ¤– " + Config.Information.Bot.name,
                                newsletterJid: "120363265419579977@newsletter"
                            },
                            externalAdReply: {
                                title: Config.Settings.Title,
                                body: Config.Settings.Watermark,
                                thumbnail: fs.readFileSync('./src/assets/img/logo.png'),
                                showAdAttribution: true,
                                renderLargerThumbnail: true,
                                mediaType: 1
                            }
                        }
                    }, { quoted: m })
                } else if (Config.Settings.typeMenu === 3 && !m.isGroup) {
                    let sections = [{ title: "Sub-Menu", highlight_label: "List Command", rows: [{ title: "ALL MENU", description: "Show all commands", id: ".allmenu" }, { title: "BASIC MENU", description: "Show basic commands", id: ".basicmenu" }, { title: "SYSTEM MENU", description: "Show system commands", id: ".systemmenu" }, { title: "MANAGEMENT MENU", description: "Show management commands", id: ".managementmenu" }, { title: "GROUP MENU", description: "Show group commands", id: ".groupmenu" }, { title: "DOWNLOADER MENU", description: "Show downloader commands", id: ".downloadmenu" }, { title: "SEARCH MENU", description: "Show search commands", id: ".searchmenu" }, { title: "UTILITIES MENU", description: "Show utilities commands", id: ".utilitiesmenu" }, { title: "FUN MENU", description: "Show fun commands", id: ".funmenu" }, { title: "ISLAMI MENU", description: "Show islami commands", id: ".islamimenu" }], }, { title: "Populer Command", highlight_label: "Populer Command", rows: [{ title: "Thanks To", description: "Show thanks to", id: ".thanks" }, { title: "Ping", description: "Show ping", id: ".ping" }, { title: "Bot Status", description: "Show bot status", id: ".botstatus" }, { title: "Owner", description: "Show owner", id: ".owner" }, { title: "Runtime", description: "Show runtime", id: ".runtime" }] }]
                    let listMessage = { title: 'Click Me :)', sections };
                    let msg = generateWAMessageFromContent(m.from, {
                        viewOnceMessage: {
                            message: {
                                "messageContextInfo": {
                                    "deviceListMetadata": {},
                                    "deviceListMetadataVersion": 2
                                },
                                interactiveMessage: proto.Message.InteractiveMessage.create({
                                    contextInfo: {
                                        mentionedJid: [m.sender],
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: '120363265419579977@newsletter',
                                            newsletterName: "ðŸ¤– " + Config.Information.Bot.name,
                                            serverMessageId: - 1
                                        },
                                        businessMessageForwardInfo: { businessOwnerJid: "6285791346128@s.whatsapp.net" },
                                        externalAdReply: {
                                            title: Config.Settings.Title,
                                            thumbnailUrl: Config.Settings.ImgUrl,
                                            sourceUrl: '',
                                            mediaType: 2,
                                            renderLargerThumbnail: false
                                        }
                                    },
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: "Powered By chocoopyy"
                                    }),
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        title: null, // `Hello, @${m.sender.split("@")[0]}!`,
                                        subtitle: "Powered By chocoopyy",
                                        hasMediaAttachment: true, ...(await prepareWAMessageMedia({ image: { url: Config.Settings.ImgUrl } }, { upload: client.waUploadToServer }))
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        buttons: [
                                            {
                                                "name": "single_select",
                                                "buttonParamsJson": JSON.stringify(listMessage)
                                            },
                                            {
                                                "name": "cta_url",
                                                "buttonParamsJson": "{\"display_text\":\"Powered By choco-md\",\"url\":\"https://whatsapp.com/channel/0029VaW00D2I7BeAKJeE5f0z\",\"merchant_url\":\"https://whatsapp.com/channel/0029VaW00D2I7BeAKJeE5f0z`\"}"
                                            },
                                        ],
                                    })
                                })
                            }
                        }
                    }, {})
                    await client.relayMessage(msg.key.remoteJid, msg.message, {
                        messageId: msg.key.id
                    })
                } else if (Config.Settings.typeMenu === 3 && m.isGroup) {
                    client.sendMessage(m.from, {
                        text: text + menu,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            mentionedJid: [m.sender],
                            forwardedNewsletterMessageInfo: {
                                newsletterName: "ðŸ¤– " + Config.Information.Bot.name,
                                newsletterJid: "120363265419579977@newsletter"
                            },
                            externalAdReply: {
                                title: Config.Settings.Title,
                                body: Config.Settings.Watermark,
                                thumbnail: fs.readFileSync('./src/assets/img/logo.png'),
                                showAdAttribution: true,
                                renderLargerThumbnail: true,
                                mediaType: 1
                            }
                        }
                    }, { quoted: m })
                }
            }
                break
            case "allmenu": {
                let text = `*All Commands*\n\n`
                Object.entries(Config.Menu).forEach(([category, commands]) => {
                    text += `*${Func.toUpper(category)} Commands*\n`
                    text += `> ${commands.map(command => `${m.prefix + command}`).join('\n> ')}\n\n`
                })
                m.reply(text)
            }
                break
            case "mainmenu":
            case "basicmenu": {
                let text = `*Main Menu*\n\n`;
                Config.Menu.basic.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "systemmenu": {
                let text = `*System Commands*\n\n`;
                Config.Menu.system.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "aimenu": {
                let text = `*AI Commands*\n\n`;
                Config.Menu.ai.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "managementmenu": {
                let text = `*Management Commands*\n\n`;
                Config.Menu.management.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "groupmenu":
            case "groupadmin": {
                let text = `*Group Commands*\n\n`;
                Config.Menu.groupAdmin.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "downloadmenu":
            case "downloadermenu": {
                let text = `*Download Commands*\n\n`;
                Config.Menu.downloader.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "searchmenu":
            case "miscellaneousmenu": {
                let text = `*Search Commands*\n\n`;
                Config.Menu.utilities.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "utilitiesmenu": {
                let text = `*Utilities Commands*\n\n`;
                Config.Menu.utilities.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "funmenu":
            case "miscellaneousmenu": {
                let text = `*Fun Commands*\n\n`;
                Config.Menu.miscellaneous.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;
            case "islamimenu": {
                let text = `*Islamic Commands*\n\n`;
                Config.Menu.islami.forEach(command => {
                    text += `> ${m.prefix + command}\n`;
                });
                m.reply(text);
            }
                break;

            case "thanks":
            case " tqto": {
                let tqto = ["Allah SWT", "Nabi Muhammad SAW", "My Parent", "Chocoo (Me)", "Adrian", "XYZ TEAMS", "ALL MY FRIENDS", "ALL MY SUPPORTERS", "ALL MY HATERS"];
                let text = `*Thanks To*\n\n`;
                tqto.forEach(command => {
                    text += `> ${command}\n`;
                });
                m.reply(text)
            }
                break
            case "sc":
            case "sourecode":{
                m.reply("contact owner")
            }
                break
            case "ping": {
                let a = await Date.now()
                m.reply("Pong!")
                let b = await Date.now()
                m.reply(`> Time taken: ${b - a}ms`)
            }
                break
            case "botstatus":
            case "info":
            case "infoserver": {
                m.reply(await infoServer())
            }
                break
            case "owner":
            case "creator":
            case "author": {
                let setMsg = await client.sendContact(m.from, Config.Owner, m);
                await client.sendMessage(
                    m.from,
                    { text: "This is my owner's number, no calls or spam texts!"},
                    { quoted: setMsg },
                );
            }
                break
            case "runtime":
            case "runtimebot": {
                let runtime = Func.runtime(process.uptime())
                m.reply(`> Bot has been active for ${runtime}`)
            }
                break
            case 'waktubukapuasa':{
                const bukapuasa = Func.getWaktuBukaPuasa()
                if (today >= ramadanStart && today <= ramadanEnd) return reply('Belum Ramadhan')
                m.reply(`Waktu buka puasa hari ini pukul ${bukapuasa}`);
                
            }
                break
            /*case 'tod':{
                client.sendMessage(m.chat, {        
                    react: {
                    text: 'ðŸ’š',
                    key: m.key,
                  }
                })      
            }
            break*/
            case 'lebaran':
            case 'idulfitri':{
                const pitri = Func.countdfitri()
                m.reply(pitri)
            }
                break
            case 'adha':
            case 'iduladha':{
                const kurban = Func.countdadha()
                m.reply(kurban)
            }
                break
            case 'hbdowner':
            case 'hbd':
            case 'ultah':
            case 'ultahowner':{
                const hbd = Func.ownerhbd()
                m.reply(hbd)
            }
                break

            // Owner Command
            case "addbadword":
            case "addword": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the bad word.")
                if (badword.includes(m.text)) return m.reply("Bad word already exists.")
                badword.push(m.text)
                fs.writeFileSync('./src/database/function/badword.json', JSON.stringify(badword))
                m.reply("Bad word has been successfully added.")
            }
                break
            case "getmenu":
            case "getcommand": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                let text = `*All Commands*\n\n`
                Object.entries(Config.Menu).forEach(([category, commands]) => {
                    text += `*${Func.toUpper(category)} Commands*\n`
                    text += `> ${commands.map(command => `${m.prefix + command}`).join('\n> ')}\n\n`
                })
                m.reply(text)
            }
                break
            case "addmenu": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the command name.")
                if (m.text.split(" ").length > 1) return m.reply("Command name cannot contain spaces.")
                if (Object.values(Config.Menu).flat().includes(m.text)) return m.reply("Command already exists.")
                Config.Menu.miscellaneous.push(m.text)
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`)
                m.reply(`Command ${m.text} has been successfully added.`)
            }
                break
            case "delmenu": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the command name.")
                if (!Object.values(Config.Menu).flat().includes(m.text)) return m.reply("Command not found.")
                Config.Menu.miscellaneous.splice(Config.Menu.miscellaneous.indexOf(m.text), 1)
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`)
                m.reply(`Command ${m.text} has been successfully deleted.`)
            }
                break
            case "getbio":
            case "getstatus": {
                if (!m.isCreator) return m.reply("This feature is only available for the creator.");
                try {
                    let a;
                    if (m.isGroup) a = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
                    let res = await client.fetchStatus(a);
                    await m.reply(util.format(res.status));
                } catch (e) {
                    if (e) return m.reply("Bio not found.");
                }

            }
                break
            case "listblock":
            case "listblocked": {
                if (!m.isCreator) return m.reply("This feature is only available for the creator.");
                let a = await client.fetchBlocklist();
                let teks = "*BLOCKED LIST*\n\n";
                for (let i of a) {
                    teks += `> @${i.split("@")[0]}\n`;
                }
                await m.reply(teks, { contextInfo: { mentionedJid: a } });
            }
                break
            case "getcase":
            case "getfitur":
            case "getfeaturs": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the case name.")
                let cases = m.text.toLowerCase()
                let a = "case  " + `'${cases}'` + fs.readFileSync("./src/client/Message.js").toString().split('case \'' + cases + '\'')[1].split("break")[0] + "break"
                m.reply(a)
            }
                break
            case "addpremium":
            case "addprem":
            case "upprem": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '')
                if (!user) return m.reply("Please tag the user.")
                if (premium.includes(user)) return m.reply("User is already premium.")
                premium.push(user)
                fs.writeFileSync('./src/database/roles/premium.json', JSON.stringify(premium))
                m.reply("User has been successfully added to premium.")
            }
                break
            case "delpremium":
            case "delprem":
            case "downprem": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '')
                if (!user) return m.reply("Please tag the user.")
                if (!premium.includes(user)) return m.reply("User is not premium.")
                premium.splice(premium.indexOf(user), 1)
                fs.writeFileSync('./src/database/roles/premium.json', JSON.stringify(premium))
                m.reply("User has been successfully removed from premium.")
            }
                break
            case "broadcastgroup":
            case "bcgroup":
            case "broadcastgp":
            case "bcgp": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the message.")
                let group = await store.chats.all().filter(v => v.id.endsWith('@g.us')).map(v => v.id)
                for (let i of group) {
                    await client.sendMessage(i, m.text)
                }
                m.reply("Broadcast to all groups has been sent.")
            }
                break
            case "getsession":
            case "getsess":
            case "getsesi": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (m.isGroup) return m.reply("This command can only be used in private chat.")
                m.reply("Getting session...")
                await client.sendMessage(m.from, { document: fs.readFileSync("./src/Session/creds.json"), fileName: "creds.json", mimeType: "application/json" }, { quoted: m })
            }
                break
            case "join":
            case "joingroup":
            case "invite": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.");
                if (!m.text) return m.reply("Please enter the group link.");
                if (!Func.isUrl(m.text) && !m.text.includes("chat.whatsapp.com")) return m.reply("The link you entered is not a group link." + m.text);
                let res = m.text.split("chat.whatsapp.com/")[1];
                await client.groupAcceptInvite(res).then(() => {
                    m.reply("Joining group...")
                }).catch(() => {
                    m.reply("Error joining group.")
                })
            }
                break
            case "leave":
            case "leavegroup": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.");
                if (!m.isGroup) return m.reply("This command can only be used in groups.");
                m.reply("Leaving group...")
                await client.groupLeave(m.from)
            }
                break
            case "setprefix":
            case "prefix": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the prefix.")
                Config.Settings.prefix = m.text
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`)
                m.reply(`> Prefix has been changed to ${m.text}`)
            }
                break
            case "setmenu":
            case "menu": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the menu type.")
                if (m.text === "1" || m.text === "2" || m.text === "3") {
                    Config.Settings.typeMenu = parseInt(m.text)
                    fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`)
                    m.reply(`> Menu type has been changed to ${m.text}`)
                } else {
                    m.reply("Menu type only 1 or 2 or 3")
                }
            }
                break
            case "setreadmsg":
            case "setread":
            case "autoread": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                Config.Settings.read = !Config.Settings.read
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`)
                m.reply(`> Auto read message has been ${Config.Settings.read ? "enabled" : "disabled"}`)
            }
                break
            case "getsw":
            case "getstatus": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!store.messages['status@broadcast'].array.length === 0) return m.reply("No status available.")
                let contacts = Object.values(store.contacts);
                let [who, value] = m.text.split(/[,|\-+&]/);
                value = value?.replace(/\D+/g, '');

                let sender;
                if (m.mentions.length !== 0) sender = m.mentions[0];
                else if (m.text) sender = contacts.find(v => [v.name, v.verifiedName, v.notify].some(name => name && name.toLowerCase().includes(who.toLowerCase())))?.id;
                let stories = store.messages['status@broadcast'].array;
                let story = stories.filter(v => (v.key && v.key.participant === sender) || v.participant === sender).filter(v => v.message && v.message.protocolMessage?.type !== 0);
                if (story.length === 0) return m.reply("No status available.");
                if (value) {
                    if (story.length < value) return m.reply("The number you entered is too large.");
                    await m.reply({ forward: story[value - 1], force: true });
                }
            }
                break
            case "listsw":
            case "liststatus": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!store.messages['status@broadcast'].array.length === 0) return m.reply("No status available.")
                let stories = store.messages['status@broadcast'].array;
                let story = stories.filter(v => v.message && v.message.protocolMessage?.type !== 0);
                if (story.length === 0) return m.reply("No status available.")
                const result = {};
                story.forEach(obj => {
                    let participant = obj.key.participant || obj.participant;
                    participant = jidNormalizedUser(participant === 'status_me' ? client.user.id : participant);
                    if (!result[participant]) {
                        result[participant] = [];
                    }
                    result[participant].push(obj);
                });
                let type = mType => (getContentType(mType) === 'extendedTextMessage' ? 'text' : getContentType(mType).replace('Message', ''));
                let text = '';
                for (let id of Object.keys(result)) {
                    if (!id) return;
                    text += `*- ${client.getName(id)}*\n`;
                    text += `${result[id].map((v, i) => `${i + 1}. ${type(v.message)}`).join('\n')}\n\n`;
                }
                await m.reply(text.trim(), { mentions: Object.keys(result) });
            }
                break
            case "restart":
            case "resetserver": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                m.reply("Restarting the server...")
                exec("pm2 restart choco", err => {
                    if (err) return process.send("reset")
                })
            }
                break
            case "shutdown":
            case "offserver": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                m.reply("Shutting down the server...")
                exec("pm2 stop choco", err => {
                    if (err) return process.send("shutdown")
                })
            }
                break
            case "myip":
            case "ipserver": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                let a = await Func.fetchJson("https://api64.ipify.org?format=json")
                m.reply(`> IP Address: ${a.ip}`)
            }
                break
            case "setbotname":
            case "setname": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the bot name.")
                Config.Information.Bot.name = m.text
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`)
                m.reply(`> Bot name has been changed to ${m.text}`)
            }
                break
            case "addapikey": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.args[0]) return m.reply("Please enter the name of the API key.");
                if (!m.args[1]) return m.reply("Please enter the API key.");
                Config.Apikey[m.args[0]] = m.args[1];
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`);
                m.reply("API key has been successfully added.")
            }
                break
            case "delapikey":
            case "deleteapikey": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.args[0]) return m.reply("Please enter the name of the API key.");
                if (!Config.Apikey[m.args[0]]) return m.reply("The API key you entered does not exist.");
                delete Config.Apikey[m.args[0]];
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`);
                m.reply("API key has been successfully deleted.")
            }
                break
            case "listapikey": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (Object.keys(Config.Apikey).length === 0) return m.reply("No API key available.")
                let text = "List API Key\n\n"
                for (let key of Object.keys(Config.Apikey)) {
                    text += `> ${key}\n`
                }
                m.reply(text)
            }
                break
            case "checkapi":
            case "checkkey":
            case "checkapikey":{
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.");
                switch (m.args[0]) {
                    case "Lol":
                    case "Lolhuman":
                        let aa = await Func.fetchJson(`https://api.lolhuman.xyz/api/checkapikey?apikey=${Config.Apikey.Lol}`)
                        let bb = `> *Username: ${aa.result.username}*\n`
                        bb += `> *Request: ${aa.result.requests}*\n`
                        bb += `> *Today: ${aa.result.today}*\n`
                        bb += `> *Account Type: ${aa.result.account_type}*\n`
                        bb += `> *Expired: ${aa.result.expired}*\n`
                        m.reply(bb)
                        break
                    case "Alya":
                        m.reply("error")
                        break;
                    case 'Kii':
                    case 'Kiicodeit':
                        let a = await Func.fetchJson(`https://api.kiicodeit.me/users/cekApikey?apikey=${Config.Apikey.Kii}`)
                        let b = `> *Username: ${a.result.usename}*\n`
                        b += `> *Email: ${a.result.email}*\n`
                        b += `> *Limit: ${a.result.limit}*\n`
                        b += `> *Premium: ${a.result.premium}*\n`
                        m.reply(b)
                        break;
                    case 'Btc':
                    case 'botcahx':
                        let c = await Func.fetchJson(`https://api.botcahx.eu.org/api/checkkey?apikey=${Config.Apikey.Btc}`)
                        let n = `> *Username: ${c.result.username}*\n`
                        n += `> *Email: ${c.result.email}*\n`
                        n += `> *Limit: ${c.result.limit}*\n`
                        n += `> *Premium: ${c.result.premium}*\n`
                        n += `> *Expired: ${c.result.expired}*\n`
                        n += `> *Today: ${c.result.todayHit}*\n`
                        n += `> *Total Hit: ${c.result.totalHit}*\n`
                        m.reply(n)
                        break;
                    default: return m.reply("*Choose:*\nLol\nAlya\nKii\nBtc")
                }
            }
                break
            case "setapikey": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.");
                if (!m.args[0]) return m.reply("Please enter the name of the API key.");
                if (!m.args[1]) return m.reply("Please enter the API key.");
                Config.Apikey[m.args[0]] = m.args[1];
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`);
            }
                break;
            case "block":
            case "blockuser": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await client.updateBlockStatus(user, "block")
                m.reply("User blocked successfully.")
            }
                break
            case "unblock":
            case "unblockuser": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
                await client.updateBlockStatus(user, "unblock")
                m.reply("User unblocked successfully.")
            }
                break
            case "listblock":
            case "listblocked": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                let a = await client.fetchBlocklist();
                if (a.length === 0) return m.reply("No blocked user available.")
                let text = "`List Blocked User`\n\n"
                for (let user of a) {
                    text += `> @${user.split("@")[0]}\n`
                }
                m.reply(text, { contextInfo: { mentionedJid: a } })
            }
                break
            case "listpc":
            case "listcontact": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (Object.keys(store.contacts).length === 0) return m.reply("No contact available.")
                let text = "`List Contact`\n\n"
                for (let user of Object.values(store.contacts)) {
                    if (user.notify === undefined) user.notify = "No Name"
                    text += `> ${user.notify} (${user.id.split("@")[0]})\n`
                }
                m.reply(text, { contextInfo: { mentionedJid: Object.keys(store.contacts) } })
            }
                break
            case "listgp":
            case "listgroup": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                let a = await store.chats.all().filter(v => v.id.endsWith('@g.us')).map(v => v.id)
                if (a.length === 0) return m.reply("No group available.")
                let txt = "`List Group`\n\n";
                txt += `> Total Group : ${a.length}\n\n`
                for (let i of a) {
                    let metaData = await client.groupMetadata(i);
                    txt += `> Nickname : ${metaData.subject}\n`
                    txt += `> Group ID : ${i.split("@")[0]}\n`
                    txt += `> Total Member : ${metaData.participants.length}\n\n\n`
                }
                m.reply(txt, { contextInfo: { mentionedJid: a } })
            }
                break
            case "delsesi":
            case "clearsesi":
            case "resetsesi": {
                if (!m.isCreator) return m.reply("Sorry, this feature is reserved for owners only. Owner's privilege!");
                await fs.readdir("./src/Session", async function (err, files) {
                    if (err) {
                        console.error(err)
                        return m.reply("An error occurred while deleting the session.")
                    }
                    let file = await files.filter(item => item.startsWith('pre-key') || item.startsWith('sender-key') || item.startsWith('session-') || item.startsWith('app-state'))
                    await file.forEach(function (a) {
                        fs.unlinkSync(`./src/Session/${a}`)
                    })
                })
                m.reply("Session has been successfully deleted.")
            }
                break
            case "settitle":
            case "settitlemenu":
            case "changetitle": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the title.")
                Config.Settings.Title = m.text
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`)
                m.reply(`> Title has been changed to ${m.text}`)
            }
                break
            case "setwm":
            case "setwatermark": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!m.text) return m.reply("Please enter the watermark.")
                Config.Settings.Watermark = m.text
                fs.writeFileSync('./src/Utils/Config.js', `export default ${util.inspect(Config)}`)
                m.reply(`> Watermark has been changed to ${m.text}`)
            }
                break
            case "setpp":
            case "setprofile": {
                if (!m.isCreator) return m.reply("Sorry, only the bot owner can use this command.")
                if (!quoted.isMedia) return m.reply("Please send the image.")
                let a = await Config.Information.Bot.number + "@s.whatsapp.net"
                const media = await Downloaded()
                try {
                    if (m.args[0] === "full") {
                        const { img } = await Func.generateProfilePicture(media);
                        await client.query({
                            tag: 'iq',
                            attrs: {
                                to: a,
                                type: 'set',
                                xmlns: 'w:profile:picture'
                            },
                            content: [{
                                tag: 'picture',
                                attrs: {
                                    type: 'image'
                                },
                                content: img
                            }]
                        });
                        await m.reply("Profile picture has been successfully updated.")
                    } else {
                        await client.updateProfilePicture(a, media)
                        await m.reply("Profile picture has been successfully updated.")
                    }
                } catch (e) {
                    m.reply("Error updating profile picture.")
                }
            }
                break

            // Group Command
            case "kick":
            case "removeuser": {
                if (!m.isGroup) return m.reply("This command can only be used in groups.")
                if (!m.isAdmin && !m.isCreator) return m.reply("Sorry, only admins can use this command.")
                if (!m.isBotAdmin) return m.reply("Bot is not an admin");
                let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                await client.groupParticipantsUpdate(m.from, [user], 'remove').then(() => {
                    m.reply("User kicked successfully.")
                }).catch(() => {
                    m.reply("Error kicking user.")
                })
            }
                break
            case "add":
            case "removeuser": {
                if (!m.isGroup) return m.reply("This command can only be used in groups.")
                if (!m.isAdmin && !m.isCreator) return m.reply("Sorry, only admins can use this command.")
                if (!m.isBotAdmin) return m.reply("Bot is not an admin");
                let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                await client.groupParticipantsUpdate(m.from, [user], 'add').then(() => {
                    m.reply("User added successfully.")
                }).catch(() => {
                    m.reply("Error adding user.")
                })
            }
                break
            case "promote":
            case "addadmin": {
                if (!m.isGroup) return m.reply("This command can only be used in groups.")
                if (!m.isAdmin && !m.isCreator) return m.reply("Sorry, only admins can use this command.")
                if (!m.isBotAdmin) return m.reply("Bot is not an admin");
                let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                await client.groupParticipantsUpdate(m.from, [user], "promote").then(() => {
                    m.reply("User promoted successfully.")
                }).catch(() => {
                    m.reply("Error promoting user.")
                })
            }
                break
            case "demote":
            case "deladmin": {
                if (!m.isGroup) return m.reply("This command can only be used in groups.")
                if (!m.isAdmin && !m.isCreator) return m.reply("Sorry, only admins can use this command.")
                if (!m.isBotAdmin) return m.reply("Bot is not an admin");
                let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                await client.groupParticipantsUpdate(m.from, [user], "demote").then(() => {
                    m.reply("User demoted successfully.")
                }).catch(() => {
                    m.reply("Error demoting user.")
                })
            }
                break
            case "closetime":
            case "timerclose": {
                if (!m.isGroup) return m.reply("This command can only be used in groups.")
                if (!m.isAdmin && !m.isCreator) return m.reply("Sorry, only admins can use this command.")

                let timer;
                switch (m.args[1]) {
                    case "second":
                    case "detik":
                        timer = m.args[0] * 1000;
                        break
                    case "minute":
                    case "menit":
                        timer = m.args[0] * 60000;
                        break;
                    case 'hour':
                    case 'jam':
                        timer = m.args[0] * 3600000;
                        break;
                    case 'day':
                    case 'hari':
                        timer = m.args[0] * 86400000;
                        break;
                    default: return m.reply("*Choose:*\nðŸ•’ second\nâ± minute\nâ° hour\nðŸ“… day\n\n*Example:*\n10 seconds*")
                }
                m.reply(`The group will be closed for ${m.args[0]} ${m.args[1]} starting from now.`);
                setTimeout(() => {
                    client.groupSettingUpdate(m.from, 'announcement');
                    m.reply('Right on time! The group has been closed by the admin.\nNow only admins can send messages.');
                }, timer);
            }
                break
            case "opentime": {
                if (!m.isGroup) return m.reply("This command is only available in groups.");
                if (!m.isAdmin && !m.isCreator) return m.reply("Only group admins can use this command.");

                let timer;
                switch (m.args[1]) {
                    case "second":
                    case "detik":
                        timer = m.args[0] * 1000;
                        break
                    case "minute":
                    case "menit":
                        timer = m.args[0] * 60000;
                        break;
                    case 'hour':
                    case 'jam':
                        timer = m.args[0] * 3600000;
                        break;
                    case 'day':
                    case 'hari':
                        timer = m.args[0] * 86400000;
                        break;
                    default: return m.reply("*Choose:*\nðŸ•’ second\nâ± minute\nâ° hour\nðŸ“… day\n\n*Example:*\n10 seconds*")
                }
                m.reply(`The group will be reopened after ${m.args[0]} ${m.args[1]} starting from now`);
                setTimeout(() => {
                    client.groupSettingUpdate(m.from, 'not_announcement');
                    m.reply('Right on time! The group has been opened by the admin.\nNow all members can send messages.');
                }, timer);
            }
                break
            case "grup":
            case "group":
            case "gc": {
                if (!m.isGroup) return m.reply("This command is only available in groups.");
                if (!m.isAdmin && !m.isCreator) return m.reply("Only group admins can use this command.");
                if (m.text === "open") {
                    client.groupSettingUpdate(m.from, 'not_announcement');
                    m.reply("Group opened successfully.")
                } else if (m.text === "close") {
                    client.groupSettingUpdate(m.from, 'announcement');
                    m.reply("Group closed successfully.")
                }
            }
                break
            case "totag":
            case "tagall": {
                if (!m.isGroup) return m.reply("This command is only available in groups.");
                if (!m.isAdmin && !m.isCreator) return m.reply("Only group admins can use this command.");
                let message = `ðŸ”” *TAG FOR ADMIN* ðŸ””\n\n*message:* ${m.text ? m.text : 'empty'}\n\n`;
                for (let i of m.metadata.participants) {
                    message += `> @${i.id.split('@')[0]}\n`;
                }
                await client.sendMessage(m.from, { text: message, mentions: m.metadata.participants.map(a => a.id) }, { quoted: m });
            }
                break
            case "h":
            case "ht":
            case "hidetag": {
                /*if (quoted.isMedia) {
                    let media = await Downloaded();
                    let upload = await Func.upload.pomf(media);
                    await client.sendMessage(m.from, { image: { url: upload }, text: m.text ? m.text : "", mentions: m.metadata.participants.map(a => a.id) }, { quoted: m })
                } else if (m.text) {*/
                if (!m.isGroup) return m.reply("This command is only available in groups.");
                if (!m.isAdmin && !m.isCreator) return m.reply("Only group admins can use this command.");
                if (!m.text) return m.reply("Apologies, but it seems like no text was provided with your command. Please provide some text for me to proceed.")
                await client.sendMessage(m.from, { text: m.text ? m.text : "", mentions: m.metadata.participants.map(a => a.id) }, { quoted: m })
            //}
        }
                break
            case "antibadword":
            case "antiword": {
                if (!m.isGroup) return m.reply("This command can only be used in groups.");
                if (!m.isAdmin && !m.isCreator) return m.reply("Sorry, only admins can do this.");
                if (!m.isBotAdmin) return m.reply("Bot is not an admin.");
                if (!m.text) return m.reply("Please enter the command.");
                if (!m.text.startsWith("on") && !m.text.startsWith("off")) return m.reply("Please enter the command.");
                if (m.text === "on") {
                    if (antibadword.includes(m.from)) return m.reply("Anti-badword has been activated in this group.");
                    antibadword.push(m.from);
                    fs.writeFileSync("./src/database/group/antibadword.json", JSON.stringify(antibadword));
                    m.reply("Successfully activated anti-badword in this group.");
                } else if (m.text === "off") {
                    if (!antibadword.includes(m.from)) return m.reply("Anti-badword has been disabled in this group.");
                    antibadword.splice(antibadword.indexOf(m.from), 1);
                    fs.writeFileSync("./src/database/group/antibadword.json", JSON.stringify(antibadword));
                    m.reply("Successfully disabled anti-badword in this group.");
                }
            }
                break
            // Downloader Command
            case "spotify":
            case "spotifydl": {
                if (!m.text) return m.reply("Please send the URL.");
                const res = await Spotifydl(m.text);
                await client.sendMessage(m.from, { audio: res, mimetype: 'audio/mp4' }, { quoted: m });
            }
                break
            case "ytmp4":
            case "youtubemp4": {
                if (!m.text) return m.reply("Please enter the YouTube video link.");
                await ytmp4(client, m, m.text)
            }
                break
            case "ytmp3":
            case "youtubemp3":
            case "youtubeaudio": {
                if (!m.text) return m.reply("Please enter the YouTube video link.");
                await ytmp3(client, m, m.text)
            }
                break
            case "tiktok":
            case "tiktokmp4":
            case "ttdl":
            case "tt": {
                if (!m.text) return m.reply("Please enter the TikTok video link.");
                try {
                    const a = await Func.fetchJson(`https://api.xyzen.tech/api/downloader/tiktok?url=${m.text}`);
                    client.sendMessage(m.from, { video: { url: a.video }, caption: a.caption }, { quoted: m })
                } catch (e) {
                    m.reply("The URL you entered is not valid.")
                }

            }
                break
            case "ttslide":
            case "tiktokslide":
            case "tiktokfoto":
            case "ttfoto": {
                if (!m.text) return m.reply("Please enter the TikTok video link.");
                const a = await Func.fetchJson(`https://api.xyzen.tech/api/downloader/ttslide?url=${m.text}`);
                for (let i = 0; i < a.result.length; i++) {
                    client.sendMessage(m.from, { image: { url: a.result[i] }, caption: `TikTok Slide ${i + 1} from ${a.result.length} Slide` }, { quoted: m })
                }
            }
                break
            case "tiktokmusic":
            case "tiktokaudio":
            case "ttmusic": {
                if (!m.text) return m.reply("Please enter the TikTok video link.");
                const a = await Func.fetchJson(`https://api.lolhuman.xyz/api/tiktokmusic?apikey=${Config.Apikey.Lol}&url=${m.text}`);
                if (a.status !== 200) return m.reply("The URL you entered is not valid.");
                await client.sendMessage(m.from, { audio: { url: a.result }, mimetype: "audio/aac" }, { quoted: m })
            }
                break
            case "igdl":
            case "ig":
            case "instagram": {
                if (!m.text) return m.reply("Please send the URL.")
                await Func.fetchJson(`https://api.xyzen.tech/api/downloader/instagram?url=${m.text}`).then(async ({ result }) => {
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].includes('.jpg') || result[i].includes('.png') || result[i].includes('.webp')) {
                            await client.sendMessage(m.from, { image: { url: result[i] } }, { quoted: m });
                        } else return await client.sendMessage(m.from, { video: { url: result[i] } }, { quoted: m });
                    }
                }).catch(() => {
                    m.reply("The URL is incorrect or there is an error with the server.")
                })
            }
                break
            case "facebook":
            case "fb":
            case "fbdl": {
                if (!m.text) return m.reply("Please send the URL.")
                try {
                    let a = await Func.fetchJson(`https://api.lolhuman.xyz/api/facebook?apikey=${Config.Apikey.Lol}&url=${m.text}`)
                    for (let i = 0; i < a.result.length; i++) {
                        if (a.result[i].includes("mp4")) {
                            await client.sendMessage(m.from, { video: { url: a.result[i] } }, { quoted: m });
                        } else {
                            await client.sendMessage(m.from, { image: { url: a.result[i] } }, { quoted: m });
                        }
                    }
                } catch (e) {
                    m.reply("The URL you entered is not valid.")
                }

            }
                break
            case "igstory":
            case "igstorydl":
            case "igdls":
            case "igdlstory": {
                if (!m.text) return m.reply("Please send the username.")
                if (m.text.startsWith("https://")) return m.reply("Please send the username, not the URL.")
                let a = await Func.fetchJson(`https://api.lolhuman.xyz/api/igstory/${m.text}?apikey=${Config.Apikey.Lol}`)
                if (a.result.length === 0) return m.reply("Sorry, the username you sent is not valid.")
                for (let i = 0; i < a.result.length; i++) {
                    if (a.result[i].includes("mp4")) {
                        await client.sendMessage(m.from, { video: { url: a.result[i] } }, { quoted: m })
                    } else {
                        await client.sendMessage(m.from, { image: { url: a.result[i] } }, { quoted: m })
                    }
                }
            }
                break
            case "gdrive":
            case "grive":
            case "drive": {
                if (!m.text) return m.reply("Please send the URL.")
                let a = await Func.fetchJson(`https://aemt.me/download/gdrive?url=${m.text}`)
                if (a.result.status === false) return m.reply("The URL you sent is not valid.")
                if (a.result.filesize > 100) return m.reply("Sorry, the file size is too large.")
                await client.sendMessage(m.from, { document: { url: a.result.data }, mimetype: a.result.mimetype, fileName: a.result.fileName }, { quoted: m })
            }
                break

            case "spotifysearch":
            case "searchspotify":
            case "spotifys": {
                if (!m.text) return m.reply("Please enter the song title.");
                let a = await Func.fetchJson(`https://api.lolhuman.xyz/api/spotifysearch?apikey=${Config.Apikey.Lol}&query=${m.text}`)

                let text = "";
                for (let i of a.result) {
                    text += `> *Title*: ${i.title}\n`
                    text += `> *Artists*: ${i.artists}\n`
                    text += `> *Duration*: ${Math.floor(i.duration / 60).toLocaleString()} Minute\n`
                    text += `> *URI*: ${i.link}\n\n`
                }
                await client.sendMessage(m.from, {
                    text: text,
                    contextInfo: {
                        externalAdReply: {
                            title: `SONG LIST FROM ${m.text.toUpperCase()}`,
                            body: "Powered By chocopyy",
                            thumbnailUrl: "https://media.suara.com/pictures/970x544/2021/07/20/90521-spotify.jpg",
                            showAdAttribution: true,
                            renderLargerThumbnail: true,
                            mediaType: 1
                        }
                    }
                }, { quoted: m })
            }
                break
            case "yts":
            case "youtubesearch":
            case "ytsearch": {
                if (!m.text) return m.reply("Please enter the song title.");
                await Func.fetchJson(`https://api.lolhuman.xyz/api/ytsearch?apikey=${Config.Apikey.Lol}&query=${m.text}`).then(async (a) => {
                    if (a.result.length === 0) return m.reply("Sorry, the song you entered is not available.")
                    let text = "";
                    for (let i of a.result) {
                        text += `> *Title*: ${i.title}\n`
                        text += `> *Published*: ${i.published}\n`
                        text += `> *Views*: ${i.views}\n\n`
                    }
                    await client.sendMessage(m.from, {
                        text: text,
                        contextInfo: {
                            externalAdReply: {
                                title: `SONG LIST FROM ${m.text.toUpperCase()}`,
                                body: "Powered By chocopyy",
                                thumbnailUrl: "https://play-lh.googleusercontent.com/vA4tG0v4aasE7oIvRIvTkOYTwom07DfqHdUPr6k7jmrDwy_qA_SonqZkw6KX0OXKAdk",
                                showAdAttribution: true,
                                renderLargerThumbnail: true,
                                mediaType: 1
                            }
                        }
                    }, { quoted: m })
                }).catch(() => {
                    m.reply("An error occurred while searching for the song.")
                })
            }
                break
            case "tiktoksearch":
            case "ttsearch":
            case "tiktoks": {
                if (!m.text) return m.reply("Please enter the query");
                let a = await Func.fetchJson(`https://aemt.me/tiktoksearch?text=${m.text}`);
                let b = a.result.data[0];
                await client.sendMessage(m.from, { video: { url: b.play }, caption: a.title }, { quoted: m });
            }
                break
            case "ytplay":
            case "play": {
                if (!m.text) return m.reply("Please enter the song title.");
                const type = m.text.toLowerCase().includes("video") ? "video" : m.text.toLowerCase().includes("audio") ? "audio" : null;
                if (!type) return m.reply("Please enter the type of song (video/audio).");
                const a = await search(m.text);
                if (a.duration > 6000) return m.reply("The duration of the song is too long.");
                if (type === "video") {
                    ytmp4(client, m, a.url)
                } else if (type === "audio") {
                    ytmp3(client, m, a.url)
                }
            }
                break
            case "removebg":
            case "removebgauto":
            case "nobg": {
                if (quoted.msg?.mimetype === 'image/jpeg' || quoted.msg?.mimetype === 'image/png') {
                    let media = await Downloaded();
                    let upload = await Func.upload.telegra(media);
                    await client.sendMessage(m.from, { image: { url: `https://api.lolhuman.xyz/api/removebg?apikey=${Config.Apikey.Lol}&img=${upload}` }, caption: Config.Information.Bot.name }, { quoted: m })
                } else {
                    m.reply("Please reply to the image.")
                }
            }
                break
            case "elaina":{
                if (!m.text) return m.reply("Please enter prompt.");
                let a = await Func.fetchJson(`https://api.kiicodeit.me/ai/character-ai?character=${Config.CAi.Elaina}&text=${m.text}&apikey=${Config.Apikey.Kii}`);
                let load = await client.sendMessage(m.from, {text: 'Elaina Typing'},{quoted:m})
                await Func.delay(4000)
                await client.sendMessage(m.from, {text: a.result, edit: load.key },{quoted:m})
            }
                break
            case "ros":
            case "kakros":{
                if (!m.text) return m.reply("Please enter prompt.");
                let a = await Func.fetchJson(`https://api.kiicodeit.me/ai/character-ai?character=${Config.CAi.Kakros}&text=${m.text}&apikey=${Config.Apikey.Kii}`);
                let load = await client.sendMessage(m.from, {text: 'Kak Ros typing'},{quoted:m})
                await Func.delay(2000)
                await client.sendMessage(m.from, {text: a.result, edit: load.key },{quoted:m})
            }
                break
            case "yamada":
            case "anna":{
                if (!m.text) return m.reply("Please enter prompt.");
                let a = await Func.fetchJson(`https://api.kiicodeit.me/ai/character-ai?character=${Config.CAi.Yamada}&text=${m.text}&apikey=${Config.Apikey.Kii}`);
                let load = await client.sendMessage(m.from, {text: 'Yamada anna typing'},{quoted:m})
                await Func.delay(3000)
                await client.sendMessage(m.from, {text: a.result, edit: load.key },{quoted:m})
            }
                break
            case "motor":
            case "pesawat":
            case "mobil":
            case "mber":{
                if (!m.text) return m.reply("Please enter prompt.");
                let a = await Func.fetchJson(`https://api.kiicodeit.me/ai/character-ai?character=${Config.CAi.Motorr}&text=${m.text}&apikey=${Config.Apikey.Kii}`);
                var torr = [
                    "Get the data, Please Wait..",
                    "Wait a minute, data is being procsessed!",
                    "Send data..",
                    a.result
                ]
                let load = await client.sendMessage(m.from, {text: 'Wait a minute, search the data'},{quoted:m})
                for (let i = 0; i < torr.length; i++) {
                await Func.delay(2000)
                await client.sendMessage(m.from, {text: torr[i], edit: load.key },{quoted:m})
            }}
                break
            case "openai":
            case "openaii":
            case "ai":
            case "chat": {
                if (!m.text) return m.reply("Please enter prompt.");
                let a = await blackbox(m.text + "\npakai bahasa indonesia", "user");
                await m.reply(a)
            }
                break
            case "choco": {
                if (!m.text) return m.reply("Please enter the text.");
                const prompt = m.text.split("|")[0] ? m.text.split("|")[0] : m.text;
                const type = m.text.split("|")[1] ? m.text.split("|")[1] : "javascript";
                let a = await blackbox(prompt, type);
                await m.reply(a);
            }
                break
            case 'smeme':
            case 'stickmeme':
            case 'stikmeme':
            case 'stickermeme':
            case 'stikermeme': {
                try {
                    let respon = `Send/reply image/sticker with caption ${m.prefix + m.command} text1|text2`
                    if (!m.quoted && !m.isMedia) return m.reply(respon)
                    if (!m.text) return m.reply(respon)
                    let media = m.quoted ? m.quoted : m
                    if (!media.isMedia) return m.reply(respon)
                    let mediaData = await Downloaded()
                    let bg = await Func.upload.telegra(mediaData)
                    let bawah = m.text.split("|")[0] ? m.text.split("|")[0] : ""
                    let atas = m.text.split("|")[1] ? m.text.split("|")[1] : ""
                    let api = await Func.fetchBuffer(`https://api.memegen.link/images/custom/${encodeURIComponent(atas)}/${encodeURIComponent(bawah)}.png?background=${bg}`)
                    let sticker = await (await import("../core/Sticker.js")).writeExif(api, { packName: Config.Settings.packName, packPublish: Config.Settings.packPublish })
                    await m.reply({ sticker })
                } catch (e) {
                    m.reply("An error occurred while processing the image.")
                }
            }
                break
            case "fmeme":
            case "fotomeme": {
                try {
                    let respon = `Send/reply image/sticker with caption ${m.prefix + m.command} text1|text2`
                    if (!m.quoted && !m.isMedia) return m.reply(respon)
                    if (!m.text) return m.reply(respon)
                    let media = m.quoted ? m.quoted : m
                    if (!media.isMedia) return m.reply(respon)
                    let mediaData = await Downloaded()
                    let bg = await Func.upload.telegra(mediaData)
                    let bawah = m.text.split("|")[0] ? m.text.split("|")[0] : ""
                    let atas = m.text.split("|")[1] ? m.text.split("|")[1] : ""
                    await client.sendMessage(m.from, { image: { url: `https://api.memegen.link/images/custom/${encodeURIComponent(atas)}/${encodeURIComponent(bawah)}.png?background=${bg}` } }, { quoted: m })
                } catch (e) {
                    m.reply("An error occurred while processing the image.")
                }
            }
            case "sticker":
            case "s":
                try {
                    if (/image|video|webp/.test(quoted.msg.mimetype)) {
                        let media = await Downloaded()
                        if (quoted.msg?.seconds > 10) return m.reply("Videos longer than 10 seconds cannot be processed.")
                        let exif
                        if (m.text) {
                            if (isPremium) return m.reply("This feature is only available for premium users.")
                            let [packname, author] = m.text.split(/[,|\-+&]/)
                            exif = { packName: packname ? packname : "", packPublish: author ? author : "" }
                        } else {
                            exif = { packName: Config.Settings.packName, packPublish: Config.Settings.packPublish }
                        }

                        let sticker = await (await import("../core/Sticker.js")).writeExif({ mimetype: quoted.msg.mimetype, data: media }, exif)
                        await m.reply({ sticker })
                    } else if (m.mentions.length !== 0) {
                        for (let id of m.mentions) {
                            await delay(1500)
                            let url = await client.profilePictureUrl(id, "image")
                            let media = await Func.fetchBuffer(url)
                            let sticker = await (await import("../core/Sticker.js")).writeExif(media, { packName: Config.Settings.packName, packPublish: Config.Settings.packPublish })
                            await m.reply({ sticker })
                        }
                    } else if (/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|mov|mp4|webm|gif))/i.test(m.text)) {
                        for (let url of Func.isUrl(m.text)) {
                            await delay(1500)
                            let media = await Func.fetchBuffer(url)
                            let sticker = await (await import("../core/Sticker.js")).writeExif(media, { packName: Config.Settings.packName, packPublish: Config.Settings.packPublish })
                            await m.reply({ sticker })
                        }
                    } else {
                        let media = await Func.fetchBuffer("https://www.hlapi.cn/api/mcj")
                        let sticker = await (await import("../core/Sticker.js")).writeExif(media, { packName: Config.Settings.packName, packPublish: Config.Settings.packPublish })
                        await m.reply({ sticker })
                    }
                } catch (e) {
                    m.reply("An error occurred while processing the image.")
                }
                break
            case "ssweb":
            case "ss": {
                if (!m.text) return m.reply("Please enter the URL.");
                if (!m.text.startsWith("http")) return m.reply("The URL you entered is not valid.")
                try {
                    await client.sendMessage(m.from, { image: { url: `https://aemt.me/sspc?url=${m.text}` }, caption: "Screenshot Web" }, { quoted: m })
                } catch (e) {
                    m.reply("An error occurred while taking a screenshot.")
                }
            }
                break
            case "tourl": {
                if (!quoted.isMedia) return m.reply("Please reply to the media.")
                if (Number(quoted.msg.fileLength) > 10000000) return m.reply("The file is too large.")
                let media = await Downloaded();
                let url = (/video|image|webp/.test(quoted.msg.mimetype)) ? await Func.upload.telegra(media) : await Func.upload.pomf(media);
                await m.reply(url)
            }
                break
                case 'pin2': {
                    if (!m.text) return m.reply(`michie`);
                    const res = await Func.fetchJson(`https://api.kiicodeit.me/search/pinterest?query=${m.text}&apikey=chocozy`);
                     
                    const url = `${res.result[0]}`;
                    const url2 = `${res.result[1]}`;
                    const url3 = `${res.result[2]}`;
                    const url4 = `${res.result[3]}`;
                    const url5 = `${res.result[4]}`;
                    async function image(url, url2, url3, url4, url5) {
                    const { imageMessage } = await baileys.generateWAMessageContent({
                        image: {
                          url, url2, url3, url4, url5
                        }
                      }, {
                        upload: client.waUploadToServer
                      })
                      return imageMessage
                    }
                    
                    
                        let msg = baileys.generateWAMessageFromContent(
                          m.chat,
                          {
                            viewOnceMessage: {
                              message: {
                                interactiveMessage: {
                                  body: { text: `Hai kak ${m.pushname} berikut 5 foto dari pinterest yang anda cari
                                  *Result By: ${m.text}` },
                                  carouselMessage: {
                                    cards: [
                                      {
                                        header: {
                                          imageMessage: await image(url),
                                          hasMediaAttachment: true,
                                        },
                                        body: { text: "Image 1/5" },
                                        nativeFlowMessage: {
                                          buttons: [
                                            {
                                              name: "cta_url",
                                              buttonParamsJson:
                                                '{"display_text":"CLICK HERE","url":"https://api.kiicodeit.me","webview_presentation":null}',
                                            },
                                          ],
                                        },
                                      },
                                      {
                                        header: {
                                          imageMessage: await image(url2),
                                          hasMediaAttachment: true,
                                        },
                                        body: { text: "Image 2/5" },
                                        nativeFlowMessage: {
                                          buttons: [
                                            {
                                              name: "cta_url",
                                              buttonParamsJson:
                                                '{"display_text":"CLICK HERE","url":"https://api.kiicodeit.me","webview_presentation":null}',
                                            },
                                          ],
                                        },
                                      },
                                                        {
                                        header: {
                                          imageMessage: await image(url3),
                                          hasMediaAttachment: true,
                                        },
                                        body: { text: "Image 3/5" },
                                        nativeFlowMessage: {
                                          buttons: [
                                            {
                                              name: "cta_url",
                                              buttonParamsJson:
                                                '{"display_text":"CLICK HERE","url":"https://api.kiicodeit.me","webview_presentation":null}',
                                            },
                                          ],
                                        },
                                      },
                                                        {
                                        header: {
                                          imageMessage: await image(url4),
                                          hasMediaAttachment: true,
                                        },
                                        body: { text: "Image 4/5" },
                                        nativeFlowMessage: {
                                          buttons: [
                                            {
                                              name: "cta_url",
                                              buttonParamsJson:
                                                '{"display_text":"CLICK HERE","url":"https://api.kiicodeit.me","webview_presentation":null}',
                                            },
                                          ],
                                        },
                                      },
                                                        {
                                        header: {
                                          imageMessage: await image(url5),
                                          hasMediaAttachment: true,
                                        },
                                        body: { text: "Image 5/5" },
                                        nativeFlowMessage: {
                                          buttons: [
                                            {
                                              name: "cta_url",
                                              buttonParamsJson:
                                                '{"display_text":"CLICK HERE","url":"https://api.kiicodeit.me","webview_presentation":null}',
                                            },
                                          ],
                                        },
                                      },
                    
                                    ],
                                    messageVersion: 1,
                                  },
                                },
                              },
                            },
                          },
                          {}
                        );
                    
                        await client.relayMessage(msg.key.remoteJid, msg.message, {
                          messageId: msg.key.id
                        });
                    };
                    break
            case "pin":
            case "pinterest":
            case "pindl": {
                if (!m.text) return m.reply("Please enter the query or URL.");
                if (m.text.startsWith("https://")) {
                    let a = await Func.fetchJson(`https://aemt.me/download/pindl?url=${m.text}`);
                    if (a.result.data.media_type !== "video/mp4") {
                        await client.sendMessage(m.from, { video: { url: a.result.data.image }, caption: a.result.data.title }, { quoted: m });
                    } else {
                        await client.sendMessage(m.from, { image: { url: a.result.data.image }, caption: a.result.data.title }, { quoted: m });
                    }
                } else {
                    if (!m.text) return m.reply("Please enter the query or URL.");
                    //if (m.isGroup) return m.reply("Please send the query in private chat.");
                    let [query, jumlah] = m.text.split("|");
                    let a = await Func.fetchJson(`https://aemt.me/pinterest?query=${m.text}`);
                    if (!a || !a.result || a.result.length === 0) return m.reply("No results found for the query.");
                    const count = jumlah ? parseInt(jumlah.trim()) : 1;
                    for (let i = 0; i < count && i < a.result.length; i++) {
                        await client.sendMessage(m.from, { image: { url: a.result[i] } }, { quoted: m });
                    }
                }
            }
                break;
            case "get":
            case "fetch":
            case "getjson": {
                if (!m.text) return m.reply("Please enter the URL.");
                if (!m.text.startsWith("http")) return m.reply("The URL you entered is not valid.")
                try {
                    if (m.text.includes(".jpg") || m.text.includes(".png") || m.text.includes(".webp")) {
                        let media = await Func.fetchBuffer(m.text);
                        await client.sendMessage(m.from, { image: media }, { quoted: m });
                    } if (m.text.includes(".mp4") || m.text.includes(".webm") || m.text.includes(".mov")) {
                        let media = await Func.fetchBuffer(m.text);
                        await client.sendMessage(m.from, { video: media }, { quoted: m });
                    } else if (m.text.startsWith("http") || m.text.startsWith("https")) {
                        let a = await Func.fetchJson(m.text);
                        await m.reply(util.format(a));
                    }
                } catch (e) {
                    m.reply("An error occurred while fetching the URL.")
                }
            }
                break
            case "remini":
            case "hdr":
            case "hd":
            case "upscale": {
                if (!isPremium) return m.reply("This feature is only available for premium users.");
                client.enhancer = client.enhancer ? client.enhancer : {};
                if (m.sender in client.enhancer) return m.reply("Please wait, there is still something in process")
                if (/image|webp/.test(quoted.msg.mimetype)) {
                    client.enhancer[m.sender] = true
                    try {
                        let media = await Downloaded();
                        let upload = await Func.upload.telegra(media);
                        let res = await Func.getBuffer(upload);
                        let imageData = Buffer.from(res, 'binary');
                        let pros = await processing(imageData, 'enhance');
                        var error;
                        client.sendMessage(m.from, { image: pros, caption: '> Done' }, { quoted: m });
                    } catch (err) {
                        console.error(err)
                        error = true
                        delete client.enhancer[m.sender]
                    } finally {
                        if (error) return m.reply("Error processing the image.");
                        delete client.enhancer[m.sender]
                    }
                } else {
                    m.reply("Please reply to an image")
                }
            }
                break;
            /*case 'toptv': {
                if (/image|video|webp/.test(quoted.msg.mimetype))
                if (!m.quoted) throw `Balas Video Dengan Caption ${m.prefix}toptv`
                //if (/video/.test(mime)) {
                var ppt = m.quoted
                var ptv = generateWAMessageFromContent(m.from, proto.Message.fromObject({
                    "ptvMessage": ppt
            }), { userJid: m.from, quoted:m})
                    client.relayMessage(m.from, ptv.message, { messageId: ptv.key.id })
                
            }
                break*/
            case "tweetc": {
                if (!m.text) return m.reply("Please enter the text.")
                let replies = Math.floor(Math.random() * 100) + 1
                let likes = Math.floor(Math.random() * 1000) + 1
                let retweets = Math.floor(Math.random() * 100) + 1
                let api = `https://some-random-api.com/canvas/misc/tweet?displayname=${m.pushName}&username=${m.pushName}&avatar=https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg&comment=${m.text}&replies=${replies + 'k'}&likes=${likes + 'k'}&retweets=${retweets + "k"}&theme=dark`
                await client.sendMessage(m.from, { image: { url: api } }, { quoted: m })
            }
                break
            case "ytc":
            case "ytcomment": {
                if (!m.text) return m.reply("Please enter the text.")
                let api = `https://some-random-api.com/canvas/misc/youtube-comment?username=${m.pushName}&avatar=https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg&comment=${m.text}`
                await client.sendMessage(m.from, { image: { url: api } }, { quoted: m })
            }
                break
            case "qoute":
            case "quotely":
            case "qc":
            case "fakechat": {
                if (quoted.isMedia) {
                    let txt = m.text ? m.text : "";
                    let media = await Downloaded();
                    let upload = await Func.upload.pomf(media);
                    let nick = m.pushName
                    let api = await Func.fetchBuffer(`https://api.xyzen.tech/api/generate/qc?avatar=https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg&name=${nick}&text=${txt}&media=${upload}`);
                    let sticker = await (await import("../core/Sticker.js")).writeExif(api, { packName: Config.Settings.packName, packPublish: Config.Settings.packPublish })
                    await m.reply({ sticker });
                } else if (m.text) {
                    if (m.text.length > 100) return m.reply("The text is too long.")
                    let nick = m.pushName
                    let api = await Func.fetchBuffer(`https://api.xyzen.tech/api/generate/qc?avatar=https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg&name=${nick}&text=${m.text}`);
                    let sticker = await (await import("../core/Sticker.js")).writeExif(api, { packName: Config.Settings.packName, packPublish: Config.Settings.packPublish })
                    await m.reply({ sticker });
                }
            }
                break
            case "carbon":
            case "carbonsh": {
                if (!m.text) return m.reply("Please enter the text.");
                if (m.text.length > 1000) return m.reply("The text is too long.")
                await m.reply(`Please wait, the process is taking place...`)
                let a = await Func.fetchJson(`https://aemt.me/carbon?text=${m.text}`);
                await client.sendMessage(m.from, { image: { url: a.result } }, { quoted: m })
            }
                break
            case "exif":
                try {
                    let webp = (await import("node-webpmux")).default
                    let img = new webp.Image()
                    await img.load(await Downloaded("src/temp/" + quoted.id))
                    await m.reply(util.format((JSON.parse(img.exif.slice(22).toString()))))
                } catch (e) {
                    m.reply(util.format(e))
                }
                break
            case 'afk': {
                if (!m.isGroup) return m.reply("This command is only available in groups.");
                let user = db.users[m.sender]
                    user.afkTime = + new Date
                    user.afkReason = m.text
                m.reply(`@${m.sender.split`@`[0]} is now AFK\n\nReason : ${user.afkReason ? user.afkReason : 'Nothing'}`)
            }
                break
            case "delete":
            case "d":
            case "del": {
                if (quoted.fromMe) {
                    await client.sendMessage(m.from, { delete: quoted.key })
                } else {
                    if (!m.isBotAdmin) return m.reply("Bot is not an admin")
                    if (!m.isAdmin) return m.reply("Sorry, only admins can do this")
                    await client.sendMessage(m.from, { delete: quoted.key })
                }
            }
                break
            case "quoted":
            case "q": {
                if (!m.isQuoted) return m.reply("Reply to the message you want to quote.")
                try {
                    var message = await smsg(client, (await store.loadMessage(m.from, m.quoted.id)), store)
                    if (!message.isQuoted) return m.reply("Quoted message does not exist")
                    await m.reply({ forward: message.quoted, force: true })
                } catch (e) {
                    m.reply("Message not found")
                }
            }
                break
            case 'calc': 
            case 'kalk': 
            case 'kalkulator': 
            case 'calculator': {
                let val = m.text
                  .replace(/[^0-9\-\/+*Ã—Ã·Ï€Ee()piPI/]/g, '')
                  .replace(/Ã—/g, '*')
                  .replace(/Ã·/g, '/')
                  .replace(/Ï€|pi/gi, 'Math.PI')
                  .replace(/e/gi, 'Math.E')
                  .replace(/\/+/g, '/')
                  .replace(/\++/g, '+')
                  .replace(/-+/g, '-')
                let format = val
                  .replace(/Math\.PI/g, 'Ï€')
                  .replace(/Math\.E/g, 'e')
                  .replace(/\//g, 'Ã·')
                  .replace(/\*Ã—/g, 'Ã—')
                try {
                  console.log(val)
                  let result = (new Function('return ' + val))()
                  if (!result) throw result
                  m.reply(`*${format}* = _${result}_`)
                } catch (e) {
                  if (e == undefined) return m.reply('Isinya?\nhanya 0-9 dan Simbol -, +, *, /, Ã—, Ã·, Ï€, e, (, ) yang disupport')
                  m.reply('Format salah, hanya 0-9 dan Simbol -, +, *, /, Ã—, Ã·, Ï€, e, (, ) yang disupport')
                }
            }
                break
            case "rvo":
                if (!quoted.msg.viewOnce) return m.reply("Please reply to a message that can only be viewed once.")
                quoted.msg.viewOnce = false
                await m.reply({ forward: quoted, force: true })
                break

            case "tiktokstalk":
            case "ttstalk": {
                if (!m.text) return m.reply("Please enter the username.");
                const a = await Func.fetchJson(`https://aemt.me/download/tiktokstalk?username=${m.text}`);
                if (!a || !a.status || !a.result) return m.reply("Failed to fetch TikTok user information.");
                const { profile, username, description, likes, followers, following, totalPosts } = a.result;
                const message = `*STALK TIKTOK*\n\n*Username*: ${username}\n*Description*: ${description}\n*Likes*: ${likes}\n*Followers*: ${followers}\n*Following*: ${following}\n*Total Posts*: ${totalPosts}`;
                await client.sendMessage(m.from, { image: { url: profile }, caption: message }, { quoted: m });
            }
                break;
            case "cariresep": {
                if (!m.text) return m.reply("Please enter the recipe name.");
                const a = await Func.fetchJson(`https://aemt.me/cariresep?query=${m.text}`);
                if (a.hasil.data.length === 0) return m.reply("The recipe you entered is not available.");
                let teks = "*List Recipe*\n\n";
                for (let i of a.hasil.data) {
                    teks += `*Title*: ${i.judul}\n*URL*: ${i.link}\n\n`;
                }
                await client.sendMessage(m.from, {
                    text: teks,
                    contextInfo: {
                        externalAdReply: {
                            title: "RECIPE LIST",
                            body: "Bot by chocopyy",
                            thumbnailUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqpuyeUCxM5QF43-HhkldENLUfNBqfsn6W2gbFQ84PtA&s",
                            showAdAttribution: true,
                            renderLargerThumbnail: true,
                            mediaType: 1
                        }
                    }
                }, { quoted: m });
            }
                break;
            case "bacaresep": {
                if (!m.text) return m.reply("Please enter the URL.");
                const a = await Func.fetchJson(`https://aemt.me/bacaresep?link=${m.text}`);
                const { judul, waktu_masak, hasil, tingkat_kesulitan, thumb, bahan, langkah_langkah } = a.hasil.data;
                let teks = `*${judul}*\n\n`;
                teks += `*Difficulty*: ${tingkat_kesulitan}\n`;
                teks += `*Cooking Time*: ${waktu_masak}\n`;
                teks += `*Result*: ${hasil}\n\n`;
                teks += `*Ingredients*:\n ${bahan}\n\n`;
                teks += `*Steps*:'n ${langkah_langkah}`;
                await client.sendMessage(m.from, {
                    text: teks,
                    contextInfo: {
                        externalAdReply: {
                            title: "RECIPE INFORMATION",
                            body: "Bot by chocopyy",
                            thumbnailUrl: thumb,
                            showAdAttribution: true,
                            renderLargerThumbnail: true,
                            mediaType: 1
                        }
                    }
                }, { quoted: m });
            }
                break;
            case "googleimage":
            case "gimage": {
                if (!m.text) return m.reply("Please enter the query.");
                let [query, jumlah] = m.text.split("|");
                jumlah = jumlah ? jumlah.trim() : 1;
                const a = await Func.fetchJson(`https://aemt.me/googleimage?query=${query}`);
                if (a.result.length === 0) return m.reply("No results found for the query.");
                for (let i = 0; i < jumlah && i < a.result.length; i++) {
                    await client.sendMessage(m.from, { image: { url: a.result[i] } }, { quoted: m });
                }
            }
                break;

            case "infogempa":
            case "gempa": {
                try {
                    let a = await Func.fetchJson("https://aemt.me/gempa");
                    if (!a || !a.result) return m.reply("Failed to fetch earthquake information.");
                    const { tanggal, jam, lintang, bujur, magnitude, kedalaman, potensi, wilayah, image } = a.result;
                    let teks = `*EARTHQUAKE INFORMATION*\n\n`;
                    teks += `*Date*: ${tanggal}\n`;
                    teks += `*Time*: ${jam}\n`;
                    teks += `*Latitude*: ${lintang}\n`;
                    teks += `*Longitude*: ${bujur}\n`;
                    teks += `*Magnitude*: ${magnitude}\n`;
                    teks += `*Depth*: ${kedalaman}\n`;
                    teks += `*Potential*: ${potensi}\n`;
                    teks += `*Region*: ${wilayah}\n`;
                    await client.sendMessage(m.from, { image: { url: image }, caption: teks }, { quoted: m });
                } catch (error) {
                    console.error("Error fetching earthquake information:", error);
                    m.reply("An error occurred while fetching earthquake information.");
                }
            }
                break;
            case "igstalk": {
                if (!m.text) return m.reply("Please enter the username.");
                try {
                    let a = await Func.fetchJson(`https://api.lolhuman.xyz/api/stalkig/${m.text}?apikey=${Config.Apikey.Lol}`);
                    if (!a || !a.result || !a.result) return m.reply("Failed to fetch user information.");
                    const { id, username, fullname, bio, photo_profile, posts, followers, following } = a.result;
                    const teks = `*INSTAGRAM STALK*\n\n*Username*: ${username}\n*Full Name*: ${fullname}\n*Biography*: ${bio}\n*Posts*: ${posts}\n*Followers*: ${followers}\n*Following*: ${following}`;
                    await client.sendMessage(m.from, { image: { url: photo_profile }, caption: teks }, { quoted: m });
                } catch (error) {
                    console.error("Error fetching user information:", error);
                    m.reply("An error occurred while fetching user information.");
                }
            }
                break;
            case "gitstalk":
            case "githubstalk":
            case "ghstalk": {
                if (!m.text) return m.reply("Please enter the username.");
                let a = await Func.fetchJson(`https://api.github.com/users/${m.text}`);
                if (!a) return m.reply("Failed to fetch user information.");
                let b = await Func.fetchJson(`https://api.github.com/users/${m.text}/repos`);
                let teks = `*GITHUB STALK*\n\n*Username*: ${a.login}\n*Name*: ${a.name}\n*Location*: ${a.location}\n*Bio*: ${a.bio}\n*Public Repos*: ${a.public_repos}\n*Followers*: ${a.followers}\n*Following*: ${a.following}\n\n*Repositories*:\n`;
                for (let i of b) {
                    teks += `> ${i.name}\n`;
                }
                await client.sendMessage(m.from, { image: { url: a.avatar_url }, caption: teks }, { quoted: m });
            }
                break
            case "toimg":
            case "toimage": {
                if (!quoted.isMedia) return m.reply("Please reply to the sticker.");
                let a = await Downloaded("src/temp/" + quoted.id);
                let b = "./src/temp/" + quoted.id + ".png"
                await fs.writeFileSync(b, Buffer.from(a))
                await client.sendMessage(m.from, { image: fs.readFileSync(b), caption: `*ID MEDIA:* ${quoted.id}` }, { quoted: m });
            }
                break
            case "tomp3":
            case "mp4tomp3":
            case "toaudio": {
                m.reply("This feature is currently disabled.")
                /*
                if (!quoted.isMedia) return m.reply("Please reply to the video.");
                if (quoted.msg.mimetype !== "video/mp4") return m.reply("Please reply to the video.");
                let videoBuffer = await Downloaded("src/temp/" + quoted.id);
                let videoFilePath = `./src/temp/${quoted.id}.mp4`;
                fs.writeFileSync(videoFilePath, Buffer.from(videoBuffer));
                let audioFilePath = `./src/temp/${quoted.id}.mp3`;
                await exec(`ffmpeg -i ${videoFilePath} ${audioFilePath}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error("Error converting video to audio:", error);
                        m.reply("An error occurred while converting video to audio.");
                    } else {
                        client.sendMessage(m.from, { audio: fs.readFileSync(audioFilePath), mimetype: "audio/mp4" }, { quoted: m });
                    }
                });
                */
            }
                break
            case "listtmp":
            case "ltmp": {
                if (!m.isCreator) return m.reply("Sorry, only the creator can do this.")
                let a = fs.readdirSync("./src/temp");
                if (a.length === 0) return m.reply("No Tmp available.")
                let text = "`List Tmp`\n\n"
                for (let sampah of a) {
                    text += `> ${sampah}\n`
                }
                m.reply(text, { contextInfo: { mentionedJid: a } })
            }
                break
            case "deltmp":
            case "deletetmp": {
                if (!m.isCreator) return m.reply("Sorry, only the creator can do this.")
                let a = fs.readdirSync("./src/temp");
                for (let b of a) {
                    if (b !== ".nomedia") {
                        fs.unlinkSync("./src/temp/" + b);
                    }
                }
                m.reply("Successfully delete temporary files.")
            }
                break
            case "2fa":
            case "code2fa":
            case "twofa": {
                if (!m.text) return m.reply("Please enter the 2FA code.");
                let a = await Func.fetchJson(`https://2fa.live/tok/${m.text}`);
                await client.sendMessage(m.sender, { text: `*2FA CODE*: ${a.token}` }, { quoted: m });
            }
                break
            case "antilink": {
                if (!m.isGroup) return m.reply("This command can only be used in groups.");
                if (!m.isAdmin) return m.reply("Sorry, only admins can do this.");
                if (!m.isBotAdmin) return m.reply("Bot is not an admin.");
                if (!m.text) return m.reply("Please enter the command.");
                if (!m.text.startsWith("on") && !m.text.startsWith("off")) return m.reply("Please enter the command.");
                if (m.text === "on") {
                    if (antilink.includes(m.from)) return m.reply("Anti-link has been activated in this group.");
                    antilink.push(m.from);
                    fs.writeFileSync("./src/database/group/antilink.json", JSON.stringify(antilink));
                    m.reply("Successfully activated anti-link in this group.");
                } else if (m.text === "off") {
                    if (!antilink.includes(m.from)) return m.reply("Anti-link has been disabled in this group.");
                    antilink.splice(antilink.indexOf(m.from), 1);
                    fs.writeFileSync("./src/database/group/antilink.json", JSON.stringify(antilink));
                    m.reply("Successfully disabled anti-link in this group.");
                }
            }
                break
            case "jadwalsholat":
            case "jadwalsolat": {
                if (!m.text) return m.reply("Please enter the city.");
                let a = await Func.fetchJson(`https://api.lolhuman.xyz/api/sholat/${m.text}?apikey=${Config.Apikey.Lol}`)
                let b = `*JADWAL SHOLAT*\n`
                b += `*City*: ${m.text}\n`
                b += `*Date*: ${a.result.tanggal}\n`
                b += `*Fajr*: ${a.result.subuh}\n`
                b += `*Sunrise*: ${a.result.dhuha}\n`
                b += `*Dhuhr*: ${a.result.dzuhur}\n`
                b += `*Asr*: ${a.result.ashar}\n`
                b += `*Maghrib*: ${a.result.maghrib}\n`
                b += `*Isha*: ${a.result.isya}\n`
                m.reply(b)
            }
                break

            // Default Command Or Eval And Exec
            default:
                if (['>', 'eval', '=>'].some(a => m.command.toLowerCase().startsWith(a)) && m.isCreator) {
                    let evalCmd = '';
                    try {
                        evalCmd = /await/i.test(m.text) ? eval('(async() => { ' + m.text + ' })()') : eval(m.text);
                    } catch (e) {
                        evalCmd = e;
                    }
                    new Promise((resolve, reject) => {
                        try {
                            resolve(evalCmd);
                        } catch (err) {
                            reject(err);
                        }
                    })
                        ?.then(res => m.reply(util.format(res)))
                        ?.catch(err => m.reply(util.format(err)));
                }
                if (['$', 'exec'].some(a => m.command.toLowerCase().startsWith(a)) && m.isCreator) {
                    try {
                        exec(m.text, async (err, stdout) => {
                            if (err) return m.reply(util.format(err));
                            if (stdout) return m.reply(util.format(stdout));
                        });
                    } catch (e) {
                        await m.reply(util.format(e));
                    }
                }

        }
    } catch (e) {
        client.sendMessage("6285791346128@s.whatsapp.net", { text: "`" + util.format(e) + "`" }, { quoted: m })
        console.error(e);
    }
}

let fileP = fileURLToPath(import.meta.url);
fs.watchFile(fileP, () => {
    fs.unwatchFile(fileP);
    console.log(`Successfully To Update File ${fileP}`)
})
