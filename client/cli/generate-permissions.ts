import axios from 'axios';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import dedent from 'ts-dedent';

import { PermissionsMap } from 'app/core/core-services/permission';

const SOURCE = 'https://raw.githubusercontent.com/OpenSlides/OpenSlides/openslides4-dev/docs/permission.yml';

const DESTINATION = path.resolve(path.join(__dirname, '../src/app/core/core-services/permission-children.ts'));

const FILE_TEMPLATE = dedent`
    // THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.

    import { Permission, PermissionsMap } from './permission';

    export const childPermissions: PermissionsMap = {
`;

function gatherPermissions(collection: string, current: object, allPermissions: PermissionsMap): string[] {
    const permissions = new Set<string>();
    for (const [key, value] of Object.entries(current || {})) {
        const permission = collection + '.' + key;
        permissions.add(permission);
        const childPermissions = gatherPermissions(collection, value, allPermissions);
        allPermissions[permission] = childPermissions;
        childPermissions.forEach(perm => permissions.add(perm));
    }
    return Array.from(permissions);
}

(async () => {
    const result = await axios.get(SOURCE);
    const permissionsYaml = yaml.load(result.data);

    const permissionsMap: PermissionsMap = {};
    for (const [collection, permissions] of Object.entries(permissionsYaml)) {
        gatherPermissions(collection, permissions, permissionsMap);
    }

    let content = FILE_TEMPLATE + '\n';
    for (const [key, value] of Object.entries(permissionsMap)) {
        content += `    "${key}": [`;
        content += value
            .map(permString => 'Permission.' + permString.replace(/[_\.]([a-z])/g, (_, c) => c.toUpperCase()))
            .join(', ');
        content += '],\n';
    }
    content += '};\n';

    // write at the end to not leave a broken state in case of error
    fs.writeFileSync(DESTINATION, content);

    console.log('Successfully generated permission children.');
})();
