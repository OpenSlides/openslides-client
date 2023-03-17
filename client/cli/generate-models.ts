import axios from 'axios';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { Project, Scope } from 'ts-morph';

const SOURCE = `https://raw.githubusercontent.com/OpenSlides/openslides-backend/main/global/meta/models.yml`;

const DESTINATION = path.resolve(path.join(__dirname, `../src/app/domain/models`));

function findModelFile(startPath: string, name: string): string | null {
    if (!fs.existsSync(startPath)) {
        console.log(`no dir `, startPath);
        return null;
    }

    let files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        let filename = path.join(startPath, files[i]);
        let stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            const found = findModelFile(filename, name); //recurse
            if (found) {
                return found;
            }
        } else if (filename.endsWith(name)) {
            return filename;
        }
    }

    return null;
}

function snakeToPascal(input: string) {
    return input
        .split(`_`)
        .map(substr => substr.charAt(0).toUpperCase() + substr.slice(1))
        .join(``);
}

(async () => {
    const result = await axios.get(SOURCE);
    const models: any = yaml.load(result.data);
    const project = new Project({});
    project.addSourceFilesAtPaths(`${DESTINATION}/**/*.ts`);
    for (const modelName of Object.keys(models)) {
        const file = findModelFile(DESTINATION, `/${modelName.replace(/["_"]/g, `-`)}.ts`);

        if (!file) {
            console.warn(`No model file for ${modelName} found`);
            continue;
        }

        const tsFile = project.getSourceFileOrThrow(file);
        let classNode = tsFile.getClass(snakeToPascal(modelName));
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

        let defaultFieldsetProp = classNode.getProperty(`DEFAULT_FIELDSET`);
        if (!defaultFieldsetProp) {
            defaultFieldsetProp = classNode.addProperty({
                isStatic: true,
                isReadonly: true,
                scope: Scope.Public,
                name: `DEFAULT_FIELDSET`,
                type: `(keyof ${classNode.getName()})[]`
            });
        }
        defaultFieldsetProp.setInitializer(`[${fieldset.map(f => `\`${f}\``).join(`, `)}]`);
        await tsFile.save();
    }
})();
