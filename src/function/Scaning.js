/**
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @xyzendev - Adriansyah
 *  © 2024 by @xyzendev - Adriansyah | MIT License
 */

import { chalk, fs, path } from "@xyzendev/modules/core/main.modules.js";

function scanDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== 'Session') {
            console.log(chalk.cyan(filePath));
            scanDirectory(filePath);
        } else if (file !== 'node_modules' && file !== '.git' && file !== 'Session') {
            console.log(chalk.green(filePath));
        }
    });
}

function centerText(text) {
    const padding = Math.floor((process.stdout.columns - text.length) / 2);
    return ' '.repeat(padding) + text + ' '.repeat(padding);
}

console.clear();
console.log(chalk.bold.yellow(centerText('Scanning all files and directories...')));

export {scanDirectory, centerText};