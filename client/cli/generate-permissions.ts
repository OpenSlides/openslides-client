import axios from 'axios';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import dedent from 'ts-dedent';

import { overloadJsFunctions } from 'src/app/infrastructure/utils/overload-js-functions';

overloadJsFunctions();

const SOURCE = 'https://raw.githubusercontent.com/OpenSlides/openslides-backend/main/global/meta/permission.yml';

const BASE_PATH = path.resolve(path.join(__dirname, `..`));
const DOMAIN_DEFINITIONS_PATH = `src/app/domain/definitions`;

const PERMISSION_FILE = path.join(DOMAIN_DEFINITIONS_PATH, `permission.ts`);
const PERMISSION_RELATIONS_FILE = path.join(DOMAIN_DEFINITIONS_PATH, 'permission-relations.ts');

const DESTINATION_PERMISSION = path.join(BASE_PATH, PERMISSION_FILE);
const DESTINATION_PERMISSION_RELATIONS = path.join(BASE_PATH, PERMISSION_RELATIONS_FILE);

const FILE_TEMPLATE_PERMISSION = dedent`
    // THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.
    /**
     * Permissions on the client are just strings. This makes clear that
     * permissions instead of arbitrary strings should be given.
     */
    export enum Permission {
`;

const FILE_TEMPLATE_PERMISSION_RELATIONS = dedent`
    // THIS FILE IS GENERATED AUTOMATICALLY. DO NOT CHANGE IT MANUALLY.
    import { Permission } from './permission';
    import { PermissionsMap } from './permission.config';
`;

const permissionMap: { [permission: string]: PermissionNode } = {};

/**
 * Helper class to generate the permission graph. Holds information about its permission as well as
 * its parents and children.
 */
class PermissionNode {
    parents: PermissionNode[] = [];
    children: PermissionNode[] = [];
    permission: string;
    enumKey: string;

    public constructor(permission: string) {
        this.permission = permission;
        this.enumKey = permission.replace(/[_\.]([a-z])/g, (_, c) => c.toUpperCase());
    }
}

type PermissionNodeRelativesField = (`children` | `parents`) & keyof PermissionNode;

/**
 * Generates a PermissionNode for each permission in the permissionMap and fills the children and
 * parents fields correctly.
 *
 * @param permissionsYaml the parsed permission.yml file
 * @returns a list of all permission nodes, sorted by their permission string
 */
function generatePermissionMap(permissionsYaml: object): PermissionNode[] {
    for (const [collection, permissions] of Object.entries(permissionsYaml)) {
        generatePermissionMapForCollection(collection, permissions);
    }
    return Object.values(permissionMap).sort((a, b) => a.permission.localeCompare(b.permission));
}

function generatePermissionMapForCollection(collection: string, permissions: object, parent?: PermissionNode): void {
    for (const [name, children] of Object.entries(permissions || {})) {
        const permission = `${collection}.${name}`;
        // try to fetch the node from the map
        let node: PermissionNode = permissionMap[permission];
        if (!node) {
            // if it does not exist, create it
            permissionMap[permission] = node = new PermissionNode(permission);
        }
        // if a parent is given, fill the arrays. If no parent is given, this is a root node and we
        // do not need to fill in any information
        if (parent) {
            node.parents.push(parent);
            parent.children.push(node);
        }
        generatePermissionMapForCollection(collection, children, node);
    }
}

/**
 * Writes the permission.ts file.
 *
 * @param nodes the list of all permission nodes, in the order they should be written to the file
 */
function writePermissions(nodes: PermissionNode[]): void {
    let content = `${FILE_TEMPLATE_PERMISSION}\n`;
    for (const node of nodes) {
        content += `    ${node.enumKey} = \`${node.permission}\`,\n`;
    }
    content += `}\n`;

    fs.writeFileSync(DESTINATION_PERMISSION, content);

    console.log(`CREATE ${PERMISSION_FILE}`);
}

/**
 * Writes the permission-relations.ts file.
 *
 * @param nodes the list of all permission nodes, in the order they should be written to the file
 */
function writePermissionRelations(nodes: PermissionNode[]): void {
    let content = FILE_TEMPLATE_PERMISSION_RELATIONS + '\n';

    for (const field of ['children', 'parents'] as PermissionNodeRelativesField[]) {
        const suffix = field.charAt(0).toUpperCase() + field.slice(1);
        content += `\nexport const permission${suffix}: PermissionsMap = {\n`;
        for (const node of nodes) {
            content += `    "${node.permission}": [`;
            getPermissionRelatives(node, field).forEach(relative => {
                content += `Permission.${relative.enumKey}, `;
            });
            content += '],\n';
        }
        content += '};\n';
    }

    fs.writeFileSync(DESTINATION_PERMISSION_RELATIONS, content);

    console.log(`CREATE ${PERMISSION_RELATIONS_FILE}`);
}

/**
 * Recursively gather all relatives of the given node, either in child or in parent direction.
 *
 * @param node the current starting node
 * @param field the field to use for the relation
 * @returns a set of all relatives of the given node in the given direction
 */
function getPermissionRelatives(node: PermissionNode, field: PermissionNodeRelativesField): Set<PermissionNode> {
    let relatives = new Set<PermissionNode>();
    for (const relative of node[field]) {
        relatives.add(relative);
        relatives.update(getPermissionRelatives(relative, field));
    }
    return relatives;
}

async function loadSource(): Promise<object> {
    const result = await axios.get(SOURCE);
    return yaml.load(result.data) as object;
}

loadSource().then(permissionsYaml => {
    const sortedPermissions = generatePermissionMap(permissionsYaml);
    writePermissions(sortedPermissions);
    writePermissionRelations(sortedPermissions);
});
