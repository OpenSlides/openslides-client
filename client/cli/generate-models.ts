import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Project, Scope } from 'ts-morph';

const SOURCE_META = path.resolve(path.join(__dirname, `../../meta/models.yml`));
const SOURCE_COLLECTIONS = path.resolve(path.join(__dirname, `../../meta/collections/`));
const DESTINATION = path.resolve(path.join(__dirname, `../src/app/domain/models`));

function findModelFile(startPath: string, name: string): string | null {
    if (!fs.existsSync(startPath)) {
        console.log(`no dir `, startPath);
        return null;
    }

    const files = fs.readdirSync(startPath);
    for (const file of files) {
        const filename = path.join(startPath, file);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            const found = findModelFile(filename, name); // recurse
            if (found) {
                return found;
            }
        } else if (filename.endsWith(name)) {
            return filename;
        }
    }

    return null;
}

function getCollectionsYaml(): string {
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

function snakeToPascal(input: string): string {
    return input
        .split(`_`)
        .map(substr => substr.charAt(0).toUpperCase() + substr.slice(1))
        .join(``);
}

(async (): Promise<void> => {
    const models: any = yaml.load(getCollectionsYaml())[`models`];
    const project = new Project({});
    project.addSourceFilesAtPaths(`${DESTINATION}/**/*.ts`);
    for (const modelName of Object.keys(models)) {
        const file = findModelFile(DESTINATION, `/${modelName.replace(/["_"]/g, `-`)}.ts`);

        if (!file) {
            console.warn(`No model file for ${modelName} found`);
            continue;
        }

        const tsFile = project.getSourceFileOrThrow(file);
        const classNode = tsFile.getClass(snakeToPascal(modelName));
        if (!classNode) {
            console.warn(`Class ${snakeToPascal(modelName)} not found in ${file}`);
            continue;
        }

        const existingProps = classNode
            .getProperties()
            .map(p => p.getName())
            .concat(...classNode.getBaseTypes().map(t => t.getProperties().map(p => p.getName())));

        const fieldset = [];
        for (const modelProp of Object.keys(models[modelName])) {
            if (!existingProps.includes(modelProp)) {
                if (models[modelName][modelProp]?.restriction_mode !== `G`) {
                    console.warn(`${classNode.getName()}: ${modelProp} missing`);
                }
            } else {
                fieldset.push(modelProp);
            }
        }

        let defaultFieldsetProp = classNode.getProperty(`REQUESTABLE_FIELDS`);
        if (!defaultFieldsetProp) {
            defaultFieldsetProp = classNode.addProperty({
                isStatic: true,
                isReadonly: true,
                scope: Scope.Public,
                name: `REQUESTABLE_FIELDS`,
                type: `keyof ${classNode.getName()}[]`
            });
        }
        defaultFieldsetProp.setInitializer(`[${fieldset.map((f: string) => `\`${f}\``).join(`, `)}]`);
        defaultFieldsetProp.setType(`(keyof ${classNode.getName()})[]`);
        await tsFile.save();
    }
})();
