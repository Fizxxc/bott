/**  
 *  Created by @xyzendev
 *  Powered by @olxyzproject
*/


import { fs } from "@xyzendev/modules/core/main.modules.js";
import ms from "ms";

const users_spam = fs.readFileSync("src/database/users/spam.json");
const users_spam_data = JSON.parse(users_spam);

/**
 * Create spam data
 *
 * @param {*} user_id
 */
const createSpam = (user_id) => {
    users_spam_data.push({
        user_id: user_id,
        created_at: Date.now(),
    });

    fs.writeFileSync("src/database/users/spam.json", JSON.stringify(users_spam_data));
}

/**
 * 
 * @param {*} user_id 
 * @returns 
 */
const checkSpam = (user_id) => {
    const user_spam = users_spam_data.find((user) => user.user_id === user_id);
    if (!user_spam) return false;

    const time = ms("5 seconds");
    if (user_spam.created_at + time > Date.now()) return true;

    return false;
}

// Export
export { createSpam, checkSpam };

setInterval(() => {
    const users_spam = fs.readFileSync("src/database/users/spam.json");
    const users_spam_data = JSON.parse(users_spam);

    users_spam_data.forEach((user, index) => {
        if (user.created_at + ms("5 seconds") < Date.now()) {
            users_spam_data.splice(index, 1);
        }
    });

    fs.writeFileSync("src/database/users/spam.json", JSON.stringify(users_spam_data));
}, ms("5 seconds"));