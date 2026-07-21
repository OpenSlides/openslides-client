import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import dedent from 'ts-dedent';
import {
    ArrayLiteralExpression,
    CallExpression,
    ObjectLiteralExpression,
    Project,
    PropertyAssignment,
    SyntaxKind
} from 'ts-morph';

import { getCollectionsYaml } from './utils';

const SETTING_DEFINITIONS = path.resolve(
    path.join(
        __dirname,
        '../src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definitions.ts'
    )
);
const DESTINATION = path.resolve(path.join(__dirname, '../src/app/domain/definitions/meeting-settings-defaults.ts'));

const FILE_TEMPLATE = dedent`
    // THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.

    export const meetingSettingsDefaults: Record<string, any> = {
`;

export function isSettingsInput(item: any): any {
    return `key` in item;
}

function getMeetingSettings(): string[] {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(SETTING_DEFINITIONS);

    const meetingSettingsDecl = sourceFile.getVariableDeclarations().find(decl => decl.getName() === 'meetingSettings');

    if (!meetingSettingsDecl) {
        throw new Error('Variable "meetingSettings" not found.');
    }

    const initializer = meetingSettingsDecl.getInitializer();

    if (!initializer || initializer.getKind() !== SyntaxKind.CallExpression) {
        throw new Error('Initializer is not a function call.');
    }

    const callExpr = initializer as CallExpression;

    const calledFn = callExpr.getExpression();
    if (calledFn.getText() !== 'fillInSettingsDefaults') {
        throw new Error(`Expected fillInSettingsDefaults(), got "${calledFn.getText()}".`);
    }

    const args = callExpr.getArguments();
    if (args.length === 0) {
        throw new Error('fillInSettingsDefaults() was called with no arguments.');
    }

    const arrayArg = args[0];

    if (arrayArg.getKind() !== SyntaxKind.ArrayLiteralExpression) {
        throw new Error(`Expected an array argument, got ${SyntaxKind[arrayArg.getKind()]}.`);
    }

    const elements = (arrayArg as ArrayLiteralExpression).getElements();

    const extractedKeys: string[] = [];

    for (const el of elements) {
        if (el.getKind() === SyntaxKind.ObjectLiteralExpression) {
            const objectEl = el as ObjectLiteralExpression;

            // Get all descendants with specific property name
            const keyProps = objectEl
                .getDescendants()
                .filter(d => d.getKind() === SyntaxKind.PropertyAssignment)
                .map(p => p as PropertyAssignment)
                .filter(p => p.getName() === 'key');

            for (const prop of keyProps) {
                const initializer = prop.getInitializer();
                if (!initializer) continue;

                // Check if value is an array literal
                if (initializer.getKind() === SyntaxKind.ArrayLiteralExpression) {
                    const array = initializer as ArrayLiteralExpression;
                    for (const element of array.getElements()) {
                        const value = element.getText().replace(/['`]/g, '');
                        extractedKeys.push(value);
                    }
                } else {
                    // Single value
                    const value = initializer.getText().replace(/['`]/g, '');
                    extractedKeys.push(value);
                }
            }
        }
    }

    return extractedKeys;
}

(async (): Promise<void> => {
    const models: any = yaml.load(getCollectionsYaml())['models'];
    const meeting = models['meeting']['fields'];

    let content = FILE_TEMPLATE + '\n';
    for (const key of getMeetingSettings()) {
        const defaultValue = meeting[key]?.default;
        if (defaultValue !== undefined) {
            content += `    "${key as string}": `;
            const defaultString = JSON.stringify(defaultValue);
            /*
            if (value.type === 'string' && !value.dontTranslateDefault) {
                content += `_(${defaultString}),\n`;
             else {
                content += `${defaultString},\n`;
            }
            */
            content += `${defaultString},\n`;
        }
    }
    content += '};\n';

    // write at the end to not leave a broken state in case of error
    fs.writeFileSync(DESTINATION, content);

    console.log('Successfully generated settings defaults.');
})();
