export type ImportListHeaderDefinition = HeaderDefinition;

interface HeaderDefinition {
    label: string;
    property: string;
    type?: `boolean` | `string` | `number`;
    isRequired?: boolean;
    isTableColumn?: boolean;
    width?: number;
    flexible?: boolean;
}
