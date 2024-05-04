(async () => {

    let msg = generateWAMessageFromContent(m.from, {
        viewOnceMessage: {
            message: {
                "messageContextInfo": {
                    "deviceListMetadata": {},
                    "deviceListMetadataVersion": 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: "test"
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: "test"
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [
                            {
                                "name": "single_select",
                                "buttonParamsJson": "{\"title\":\"title\",\"sections\":[{\"title\":\"title\",\"highlight_label\":\"label\",\"rows\":[{\"header\":\"header\",\"title\":\"Owner\",\"description\":\"description\",\"id\":\".owner\"},{\"header\":\"header\",\"title\":\"title\",\"description\":\"description\",\"id\":\"id\"}]}]}"
                            }
                        ],
                    })
                })
            }
        }
    }, {})

    await client.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id
    })
})()


[
    {
        "name": "quick_reply",
        "buttonParamsJson": "{\"display_text\":\"quick_reply\",\"id\":\".play a thousand year\"}"
    },
    {
        "name": "cta_url",
        "buttonParamsJson": "{\"display_text\":\"url\",\"url\":\"https://www.google.com\",\"merchant_url\":\"https://www.google.com\"}"
    },
    {
        "name": "cta_call",
        "buttonParamsJson": "{\"display_text\":\"call\",\"id\":\"message\"}"
    },
    {
        "name": "cta_copy",
        "buttonParamsJson": "{\"display_text\":\"copy\",\"id\":\"123456789\",\"copy_code\":\"message\"}"
    },
    {
        "name": "cta_reminder",
        "buttonParamsJson": "{\"display_text\":\"cta_reminder\",\"id\":\"message\"}"
    },
    {
        "name": "cta_cancel_reminder",
        "buttonParamsJson": "{\"display_text\":\"cta_cancel_reminder\",\"id\":\"message\"}"
    },
    {
        "name": "address_message",
        "buttonParamsJson": "{\"display_text\":\"address_message\",\"id\":\"message\"}"
    },
    {
        "name": "send_location",
        "buttonParamsJson": ""
    }
]

const buttons = {
    name: "cta_url",
    buttonParamsJson: {
        "display_text": "url",
        "url": "https://www.google.com",
        "merchant_url": "https://www.google.com"
    }
}


client.sendButtonCustom(m.from, 'Hello', buttons, 'Hello', m)

const list = {
    title: "Click Here",
    sections: [
        {
            title: "List Menu",
            highlight_label: "Menu",
            rows: [
                {
                    title: "All Menu",
                    description: "List all menu",
                    id: ".allmenu",
                },
            ],
        },
    ],
};

client.sendListWithImage(m.from, "List Menu", list, "Powered By Chocopyy", "https://telegra.ph/file/93c7ea92cc2cfbbb1a2c2.jpg", m)
client.sendList(m.from, "All Fitur", list, "Powered By Chocopyy", m)

let { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require("@xyzendev/baileys")
let tekss = woi
let sections = [{
    title: 'Artificial Intelligence ( Ai )',
    highlight_label: 'Populer Plugins',
    rows: [{
        title: '',
        description: `\n\n\n\nAku Pedo Ygy`,
        id: '.menu'
    },
    {
        title: 'Tqto',
        description: "People who collaborate in development",
        id: '.menu'
    }]
}]

let listMessage = {
    title: 'List Menu',
    sections
};
//throw listMessage.sections[0].rows
let msg = generateWAMessageFromContent(m.chat, {
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
                        newsletterJid: '120363288101737637@newsletter',
                        newsletterName: 'Powered By Dinoo - Wabot',
                        serverMessageId: -1
                    },
                    businessMessageForwardInfo: { businessOwnerJid: ptz.decodeJid(ptz.user.id) },
                    externalAdReply: {
                        title: 'Dinoo',
                        thumbnailUrl: 'https://telegra.ph/file/93c7ea92cc2cfbbb1a2c2.jpg',
                        sourceUrl: '',
                        mediaType: 2,
                        renderLargerThumbnail: false
                    }
                },
                body: proto.Message.InteractiveMessage.Body.create({
                    text: tekss
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: `${Kyuu}${footer}${Kyuu}`
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                    title: `* Hello, @${m.sender.replace(/@.+/g, '')}! *`,
                    subtitle: "dcdXdino",
                    hasMediaAttachment: true, ...(await prepareWAMessageMedia({ image: { url: 'https://telegra.ph/file/93c7ea92cc2cfbbb1a2c2.jpg' } }, { upload: ptz.waUploadToServer }))
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                        {
                            "name": "single_select",
                            "buttonParamsJson": JSON.stringify(listMessage)
                        },
                        {
                            "name": "cta_url",
                            "buttonParamsJson": "{\"display_text\":\"Saluran WhatsApp\",\"url\":\"https://whatsapp.com/channel/0029Vab66Zg2975JaeaDKL1G\",\"merchant_url\":\"https://whatsapp.com/channel/0029Vab66Zg2975JaeaDKL1G\"}"
                        },
                        {
                            "name": "quick_reply",
                            "buttonParamsJson": "{\"display_text\":\"\np\",\"id\":\".owner\"}"
                        },
                    ],
                })
            })
        }
    }
}, {})

await ptz.relayMessage(msg.key.remoteJid, msg.message, {
    messageId: msg.key.id
})

[
    {
        title: "All Menu Bot >_<",
        rows: [
            { title: "⌲ 「 All Menu 」", rowId: `${prefix}allmenu`, description: `Menampilkan All Menu` }
        ]
    },
    {
        title: "List Menu Simpel Bot >_<",
        rows: [
            { title: "⌲ 「 Anonymous Chat Menu 」", rowId: `${prefix}anonymousmenu`, description: `Menampilkan Anonymous Chat Menu` },
            { title: "⌲ 「 Anime Menu 」", rowId: `${prefix}animemenu`, description: `Menampilkan Anime Menu` },
            { title: "⌲ 「 Asupan Menu 」", rowId: `${prefix}asupanmenu`, description: `Menampilkan Asupan Menu` },
            { title: "⌲ 「 Convert Menu 」", rowId: `${prefix}convertmenu`, description: `Menampilkan Convert Menu` },
            { title: "⌲ 「 Download Menu 」", rowId: `${prefix}downloadmenu`, description: `Menampilkan Download Menu` },
            { title: "⌲ 「 Database Menu 」", rowId: `${prefix}databasemenu`, description: `Menampilkan Database Menu` },
            { title: "⌲ 「 Ephoto Menu 」", rowId: `${prefix}ephotomenu`, description: `Menampilkan Ephoto Menu` },
            { title: "⌲ 「 Group Menu 」", rowId: `${prefix}groupmenu`, description: `Menampilkan Group Menu` },
            { title: "⌲ 「 Game Menu 」", rowId: `${prefix}gamemenu`, description: `Menampilkan Game Menu` },
            { title: "⌲ 「 Islamic Menu 」", rowId: `${prefix}islamicmenu`, description: `Menampilkan Islamic Menu` },
            { title: "⌲ 「 Kerang Menu 」", rowId: `${prefix}kerangmenu`, description: `Menampilkan Kerang Menu` },
            { title: "⌲ 「 Meme Menu 」", rowId: `${prefix}mememenu`, description: `Menampilkan Meme Menu` },
            { title: "⌲ 「 Main Menu 」", rowId: `${prefix}mainmenu`, description: `Menampilkan Main Menu` },
            { title: "⌲ 「 Owner Menu 」", rowId: `${prefix}ownermenu`, description: `Menampilkan Owner Menu` },
            { title: "⌲ 「 Primbon Menu 」", rowId: `${prefix}primbonmenu`, description: `Menampilkan Primbon Menu` },
            { title: "⌲ 「 Photo Editor Menu 」", rowId: `${prefix}photoeditormenu`, description: `Menampilkan Photo Editor Menu` },
            { title: "⌲ 「 Quotes Menu 」", rowId: `${prefix}quotesmenu`, description: `Menampilkan Quotes Menu` },
            { title: "⌲ 「 Random Menu 」", rowId: `${prefix}randommenu`, description: `Menampilkan Random Menu` },
            { title: "⌲ 「 Sticker Menu 」", rowId: `${prefix}stickermenu`, description: `Menampilkan Sticker Menu` },
            { title: "⌲ 「 Search Menu 」", rowId: `${prefix}searchmenu`, description: `Menampilkan Search Menu` },
            { title: "⌲ 「 Stalk Menu 」", rowId: `${prefix}stalkmenu`, description: `Menampilkan Stalk Menu` },
            { title: "⌲ 「 Text Pro Menu 」", rowId: `${prefix}textpromenu`, description: `Menampilkan Text Pro Menu` },
            { title: "⌲ 「 Voice Changer Menu 」", rowId: `${prefix}voicemenu`, description: `Menampilkan Voice Changer Menu` },
            { title: "⌲ 「 Webzone Menu 」", rowId: `${prefix}webzonemenu`, description: `Menampilkan Webzone Menu` },
            { title: "⌲ 「 Wallpaper Menu 」", rowId: `${prefix}wallpapermenu`, description: `Menampilkan Wallpaper Menu` }
        ]
    },
    {
        title: "Rules Bot >_<",
        rows: [
            { title: "⌲ 「 Rules Bot 」", rowId: `${prefix}rules`, description: `Klik Untuk Melihat Rules Bot` }
        ]
    },
    {
        title: "Open Jasa Sewabot >_<",
        rows: [
            { title: "⌲ 「 Sewa Bot 」", rowId: `${prefix}sewabot`, description: `Klik Untuk Melihat Harga Sewabot` }
        ]
    },
    {
        title: "Open Donasi >_<",
        rows: [
            { title: "⌲ 「 Open Donasi 」", rowId: `${prefix}donasi`, description: `Bantu Support Creator Guys` }
        ]
    },
    {
        title: "Info Tentang Bot? >_<",
        rows: [
            { title: "⌲ 「 Info Bot 」", rowId: `${prefix}ping`, description: `Klik Untuk Melihat Info Bot` }
        ]
    },
    {
        title: "Info Tentang Owner? >_<",
        rows: [
            { title: "⌲ 「 Chat Owner 」", rowId: `${prefix}owner`, description: `Menampilkan Nomor WhatsApp Owner` }
        ]
    },
    {
        title: "Thanks To >_<",
        rows: [
            { title: "⌲ 「 Contributor 」", rowId: `${prefix}tqtt`, description: `Menampilkan Nama Teman - Teman Saya Yang Sudah Membantu Merakit Bot Ini !!` }
        ]
    }
]
akame.sendListMsg(m.chat, simple, ntiktok, `Hello Everyone !`, `Touch Me (⁠≧⁠▽⁠≦⁠)`, sections, floc)

client.sendMessage(m.from, {
    text: `@${m.from}`,
    mentions: m.participants.map((a) => a.id),
    contextInfo: {
        groupMentions: [
            {
                groupSubject: "everyone",
                groupJid: m.from,
            },
        ],
    },
});