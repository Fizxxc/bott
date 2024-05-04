/**
 *  Created By Adrian on 15/04/2024
 *  LICENSE MIT
 *  Source: https://www.blackbox.ai
 * 
 *  My Contact: +6289513081052 (WhatsApp)
 *  Email: creator@xyzen.tech
 *  Instagram: @this.dryan
 *  Twitter: @xyzendev
 *  Telegram: @xyzendev
 */


import axios from "axios";

/**
 *
 * @export
 * @param {*} prompt
 * @param {string} [type="javascript"]
 * @return {*} 
 */

export async function blackbox(prompt, type = "javascript") {
    try {
        const response = await axios.post("https://www.blackbox.ai/api/chat", {
            messages: [{ id: "hDHivph", content: prompt, role: "user" }],
            previewToken: null,
            userId: "87a6e0b5-bbaf-45a3-b924-87a92b1985ad",
            codeModelMode: true,
            agentMode: {},
            trendingAgentMode: {
                mode: true,
                id: type
            },
            isMicMode: false,
            isChromeExt: false,
            githubToken: null
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        let a = response.data;
        const regex = /Sources:.*\n?/; // Ekspresi reguler untuk mencocokkan baris "Sources:" dan setelahnya
        a = a.replace(regex, '');
        return a;
    } catch (err) {
        console.error(err);
        return null;
    }
}