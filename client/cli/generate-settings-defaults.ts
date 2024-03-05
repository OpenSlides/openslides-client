import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import dedent from 'ts-dedent';

import { MeetingSettingsDefinitionService } from '../src/app/site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definition.service';

const SOURCE = path.resolve(path.join(__dirname, '../src/meta/models.yml'));
const DESTINATION = path.resolve(path.join(__dirname, '../src/app/domain/definitions/meeting-settings-defaults.ts'));

const FILE_TEMPLATE = dedent`
    // THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.

    import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
    import { Settings } from 'src/app/domain/models/meetings/meeting';

    export const meetingSettingsDefaults: { [key in keyof Settings]: any } = {
`;

(async () => {
    const buffer = fs.readFileSync(SOURCE);
    const models: any = yaml.load(buffer.toString());
    const meeting = models['meeting'];

    const provider = new MeetingSettingsDefinitionService();

    let content = FILE_TEMPLATE + '\n';
    for (const key of provider.getSettingsKeys()) {
        const value = provider.settingsMap[key];
        const defaultValue = meeting[key].default;
        if (defaultValue !== undefined) {
            provider.validateDefault(key, defaultValue);
            content += `    "${key}": `;
            const defaultString = JSON.stringify(defaultValue);
            if (value.type === 'string' && !value.dontTranslateDefault) {
                content += `_(${defaultString}),\n`;
            } else {
                content += `${defaultString},\n`;
            }
        }
    }
    content += '};\n';

    // write at the end to not leave a broken state in case of error
    fs.writeFileSync(DESTINATION, content);

    console.log('Successfully generated settings defaults.');
})();
