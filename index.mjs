import fs from 'fs/promises';
import path from 'path';
import { analyzeLicenses } from './analyzeLicenses.mjs';

async function countFiles(dirPath, dirContent, count = 0) {
    for (const item of dirContent) {
        if (item.isFile()) {
            count++;
        } else if (item.isDirectory()) {
            count = await countFiles(path.join(dirPath, item.name), await fs.readdir(path.join(dirPath, item.name), { withFileTypes: true }), count);
        }
    }
    return count;
}

async function main() {
    try {
        const dirContent = await fs.readdir('./node_modules', { withFileTypes: true });
        const totalFiles = await countFiles('./node_modules', dirContent);
        console.log('Total files:', totalFiles);

        const { licensesMap, errors } = await analyzeLicenses('./node_modules', dirContent);
        console.log('License types and counts:', Object.fromEntries(licensesMap));

        // Write summary to file
        const summaryFilePath = 'licenses_summary.json';
        await fs.writeFile(summaryFilePath, JSON.stringify(Object.fromEntries(licensesMap), null, 2));
        console.log(`Summary of licenses has been written to ${summaryFilePath}`);

        // Write errors to file
        const errorFilePath = 'errors.json';
        await fs.writeFile(errorFilePath, JSON.stringify(errors, null, 2));
        console.log(`Errors have been written to ${errorFilePath}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
