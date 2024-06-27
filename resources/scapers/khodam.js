/** 
 *  Scrape By Muhammad Adriansyah
 *  CopyRight 2024 MIT License 
 * https://github.com/xyzencode
 
 *  Recode : @chocodevs
*/

import axios from "axios";
import cheerio from "cheerio";

export default async function Khodam(nama) {
    return new Promise(async (resolve, reject) => {
        await axios.get(`https://khodam.vercel.app/v2?nama=${nama}`).then(({ data }) => {
            const $ = cheerio.load(data);

            const khodam = $('.__className_cad559').text().trim().split('✨')[1];
            const result = {
                nama,
                khodam,
                share: `https://khodam.vercel.app/v2?nama=${nama}&share`
            }
            resolve(result);
        }).catch(reject);
    })
}