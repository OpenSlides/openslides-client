import axios from 'axios';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import dedent from 'ts-dedent';

import { PermissionsMap } from 'app/domain/definitions/permission.config';
import { Permission } from 'app/domain/definitions/permission';

const SOURCE = 'https://raw.githubusercontent.com/OpenSlides/openslides-backend/main/global/meta/permission.yml';

const PATH_TO_DOMAIN_DEFINITIONS = `src/app/domain/definitions`;
const MAIN_PATH = path.resolve(path.join(__dirname, `..`, PATH_TO_DOMAIN_DEFINITIONS));

const DESTINATION_PERMISSION = path.resolve(path.join(MAIN_PATH, `permission.ts`));
const DESTINATION_PERMISSION_CHILDREN = path.resolve(path.join(MAIN_PATH, 'permission-children.ts'));

const FILE_TEMPLATE_PERMISSION = dedent`
    // THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.
    /**
     * Permissions on the client are just strings. This makes clear, that
     * permissions instead of arbitrary strings should be given.
     */
    export enum Permission {
`;

const FILE_TEMPLATE_PERMISSION_CHILDREN = dedent`
    // THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.
    import { Permission } from './permission';
    import { PermissionsMap } from './permission.config';
    export const childPermissions: PermissionsMap = {
`;

const permissionMap: { [collection: string]: { [permissionKey: string]: string } } = {};
const permissionChildrenMap: PermissionsMap = {};

function buildPermissionChildrenMap(collection: string, current: object): string[] {
    const permissions = new Set<string>();
    for (const [key, value] of Object.entries(current || {})) {
        const permission: keyof PermissionsMap = (collection + '.' + key) as keyof PermissionsMap;
        permissions.add(permission);
        const childPermissions: Permission[] = buildPermissionChildrenMap(collection, value) as Permission[];
        permissionChildrenMap[permission] = childPermissions;
        childPermissions.forEach(perm => permissions.add(perm));
    }
    return Array.from(permissions);
}

function buildPermissionMap(collection: string, collectionYaml: object): void {
    const collectionPermissions = createCollectionPermissions(collection, collectionYaml);
    collectionPermissions.sort((a, b) => a.value.localeCompare(b.value));
    permissionMap[collection] = {};
    for (const { key, value } of collectionPermissions) {
        permissionMap[collection][key] = value;
    }
}

function createCollectionPermissions(
    collection: string,
    current: object,
    collectionPermissions: { key: string; value: string }[] = []
): { key: string; value: string }[] {
    for (const [key, value] of Object.entries(current || {})) {
        const permissionValue = `${collection}.${key}`;
        const permissionKey = `${collection}_${key}`.replace(/[_\.]([a-z])/g, (_, character) =>
            character.toUpperCase()
        );
        collectionPermissions.push({ key: permissionKey, value: permissionValue });
        createCollectionPermissions(collection, value, collectionPermissions);
    }
    return collectionPermissions;
}

const loadSource = async () => {
    const result = await axios.get(SOURCE);
    return yaml.load(result.data) as string | number | object;
};

const generatePermissions = (permissionsYaml: string | number | object) => {
    for (const [collection, permissions] of Object.entries(permissionsYaml)) {
        buildPermissionMap(collection, permissions);
    }

    let content = `${FILE_TEMPLATE_PERMISSION}`;
    for (const [_, map] of Object.entries(permissionMap)) {
        content += `\n`;
        for (const [permissionKey, permissionValue] of Object.entries(map)) {
            content += `    ${permissionKey} = \`${permissionValue}\`,\n`;
        }
    }
    content += `};\n`;

    fs.writeFileSync(DESTINATION_PERMISSION, content);

    console.log(`CREATE ${PATH_TO_DOMAIN_DEFINITIONS}/permission.ts`);
};

const generateChildPermissions = (permissionsYaml: string | number | object) => {
    for (const [collection, permissions] of Object.entries(permissionsYaml)) {
        buildPermissionChildrenMap(collection, permissions);
    }

    let content = FILE_TEMPLATE_PERMISSION_CHILDREN + '\n';
    for (const [key, value] of Object.entries<string[]>(permissionChildrenMap)) {
        content += `    "${key}": [`;
        content += value
            .map(permString => 'Permission.' + permString.replace(/[_\.]([a-z])/g, (_, c) => c.toUpperCase()))
            .join(', ');
        content += '],\n';
    }
    content += '};\n';

    // write at the end to not leave a broken state in case of error
    fs.writeFileSync(DESTINATION_PERMISSION_CHILDREN, content);

    console.log(`CREATE ${PATH_TO_DOMAIN_DEFINITIONS}/permission-children.ts`);
};

loadSource().then(permissionsYaml => {
    generatePermissions(permissionsYaml);
    generateChildPermissions(permissionsYaml);
});
