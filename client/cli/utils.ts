import * as fs from 'fs';
import * as path from 'path';

const SOURCE_META = path.resolve(path.join(__dirname, `../../meta/collection-meta.yml`));
const SOURCE_COLLECTIONS = path.resolve(path.join(__dirname, `../../meta/collections/`));

export function getCollectionsYaml(): string {
    if (!fs.existsSync(SOURCE_COLLECTIONS)) {
        console.log(`no dir `, SOURCE_COLLECTIONS);
        return null;
    }

    let content = fs.readFileSync(SOURCE_META).toString();
    content += `\nmodels:`;
    const files = fs.readdirSync(SOURCE_COLLECTIONS);
    for (const file of files) {
        const filename = path.join(SOURCE_COLLECTIONS, file);
        if (filename.endsWith(`.yml`)) {
            const collection = fs.readFileSync(filename).toString().replace(/^(.)/gm, `    $1`);
            content += `\n  ${file.substring(0, file.length - 4)}:\n${collection}`;
        }
    }

    return content;
}

export function snakeToPascal(input: string): string {
    return input
        .split(`_`)
        .map(substr => substr.charAt(0).toUpperCase() + substr.slice(1))
        .join(``);
}
