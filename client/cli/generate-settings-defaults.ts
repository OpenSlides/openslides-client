import axios from 'axios';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import dedent from 'ts-dedent';

import { MeetingSettingsDefinitionProvider } from 'app/core/ui-services/meeting-settings-definition-provider.service';

const SOURCE = 'https://raw.githubusercontent.com/OpenSlides/openslides-backend/main/global/meta/models.yml';

const DESTINATION = path.resolve(
    path.join(__dirname, '../src/app/core/repositories/management/meeting-settings-defaults.ts')
);

const FILE_TEMPLATE = dedent`
    // THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.

    import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

    export const meetingSettingsDefaults: { [key: string]: any } = {
`;

(async () => {
    const result = await axios.get(SOURCE);
    const models = yaml.load(result.data);
    const meeting = models['meeting'];

    const provider = new MeetingSettingsDefinitionProvider();

    let content = FILE_TEMPLATE + '\n';
    for (const [key, value] of Object.entries(provider.getSettingsMap())) {
        const defaultValue = meeting[key].default;
        if (defaultValue !== undefined) {
            provider.validateDefault(key, defaultValue);
            content += `    "${key}": `;
            const defaultString = JSON.stringify(defaultValue);
            if ((!value.type || value.type === 'string') && !value.dontTranslateDefault) {
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
