import fs from 'fs/promises';
import path from 'path';

async function analyzeLicenses(dirPath, dirContent, licensesMap = new Map(), errors = []) {
    for (const item of dirContent) {
        if (item.isDirectory()) {
            const packageJsonPath = path.join(dirPath, item.name, 'package.json');
            try {
                await fs.access(packageJsonPath, fs.constants.F_OK);
                const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
                const packageJson = JSON.parse(packageJsonContent);
                const licenseType = (typeof packageJson.license === 'object') ? packageJson.license.type : packageJson.license;
                licensesMap.set(licenseType || 'Unknown', (licensesMap.get(licenseType) || 0) + 1);
                await analyzeLicenses(path.join(dirPath, item.name), await fs.readdir(path.join(dirPath, item.name), { withFileTypes: true }), licensesMap, errors);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    errors.push({ message: `Error: package.json not found in ${packageJsonPath}` });
                } else {
                    console.error(`Error processing package.json in ${packageJsonPath}:`, error);
                }
            }
        }
    }
    return { licensesMap, errors };
}

export { analyzeLicenses };
