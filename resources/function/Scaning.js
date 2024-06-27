/**
 *  The MIT License (MIT)
 *  Copyright (c) 2024 by @choxzyndev - Rasya
 *  © 2024 by @choxzydev - Rasya | MIT License
 */

import chalk from "chalk";
import fs from "fs";
import path from "path";

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